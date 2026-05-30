package com.tbank.tevent.s3;

import com.tbank.tevent.s3.dto.PresignedUpload;
import com.tbank.tevent.s3.exception.ImageAccessDeniedException;
import com.tbank.tevent.s3.exception.ImageNotFoundException;
import com.tbank.tevent.s3.exception.InvalidImageRequestException;
import io.awspring.cloud.s3.ObjectMetadata;
import io.awspring.cloud.s3.S3Template;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.net.URL;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {
    private static final String PENDING_UPLOAD_INDEX_KEY = "s3:pending:index";

    private static final Map<String, String> ALLOWED_CONTENT_TYPES = Map.of(
            "image/jpeg", "jpg",
            "image/jpg", "jpg",
            "image/png", "png",
            "image/webp", "webp",
            "application/pdf", "pdf"
    );

    private final S3Template s3Template;
    private final StringRedisTemplate redisTemplate;
    private final S3Client s3Client;

    @Value("${spring.cloud.aws.s3.bucket-name:tbank-receipts}")
    private String bucketName;

    @Value("${app.s3.presign-ttl-minutes:15}")
    private long presignTtlMinutes;

    @Value("${app.s3.pending-ttl-hours:1}")
    private long pendingUploadTtlHours;

    @Value("${app.s3.cleanup-batch-size:100}")
    private int cleanupBatchSize;

    @Value("${app.s3.max-file-size-bytes:3145728}")
    private long maxFileSizeBytes;

    // Создание presigned URL на загрузку + регистрация ключа в Redis
    public PresignedUpload generateUploadUrl(UUID userId, String contentType, Long fileSizeBytes) {
        validateExpectedFileSize(fileSizeBytes);

        String normalizedContentType = normalizeContentType(contentType);
        String extension = ALLOWED_CONTENT_TYPES.get(normalizedContentType);
        String key = String.format("receipts/%s/%s.%s", userId, UUID.randomUUID(), extension);

        ObjectMetadata objectMetadata = ObjectMetadata.builder()
                .contentType(normalizedContentType)
                .build();

        URL url = s3Template.createSignedPutURL(
                bucketName,
                key,
                Duration.ofMinutes(presignTtlMinutes),
                objectMetadata,
                normalizedContentType
        );
        try {
            savePendingUpload(key);
        } catch (Exception ex) {
            log.warn("Failed to register pending upload in redis, key={}", key, ex);
        }

        log.info("Generated presigned upload URL, userId={}, key={}", userId, key);
        return new PresignedUpload(key, url.toString(), presignTtlMinutes * 60);
    }

    // Создаение presigned URL на скачивание файла
    public String generateDownloadUrl(String s3Key) {
        if (s3Key == null || s3Key.isBlank()) {
            return null;
        }
        if (!s3Template.objectExists(bucketName, s3Key)) {
            return null;
        }
        URL url = s3Template.createSignedGetURL(
                bucketName,
                s3Key,
                Duration.ofMinutes(presignTtlMinutes)
        );
        return url.toString();
    }

    // Удаление объекта из хранилища и из pending-индекса Redis
    public void deleteFile(UUID userId, String s3Key) {
        validateOwnership(userId, s3Key);
        s3Template.deleteObject(bucketName, s3Key);
        removePendingUpload(s3Key);
        log.info("Deleted object from s3, userId={}, key={}", userId, s3Key);
    }

    // Помечает ключ как использованный и убирает из pending-индекса
    public void useKey(String s3Key) {
        if (s3Key == null || s3Key.isBlank()) {
            return;
        }

        if (!s3Key.startsWith("receipts/")) {
            return;
        }

        enforceFileSizeLimit(s3Key);

        try {
            removePendingUpload(s3Key);
        } catch (Exception ex) {
            log.warn("Failed to use image key in redis, key={}", s3Key, ex);
        }

        log.info("Image key marked as used, key={}", s3Key);
    }

    // Предвалидация ожидаемого размера файла
    private void validateExpectedFileSize(Long fileSizeBytes) {
        if (fileSizeBytes == null) {
            return;
        }
        if (fileSizeBytes <= 0) {
            throw new InvalidImageRequestException("file_size_bytes must be greater than zero");
        }
        if (fileSizeBytes > maxFileSizeBytes) {
            throw new InvalidImageRequestException("File size exceeds configured limit");
        }
    }

    // Валидация реального размера уже загруженного файла
    private void enforceFileSizeLimit(String s3Key) {
        try {
            Long objectSize = s3Client.headObject(
                    HeadObjectRequest.builder()
                            .bucket(bucketName)
                            .key(s3Key)
                            .build()
            ).contentLength();

            if (objectSize != null && objectSize > maxFileSizeBytes) {
                s3Template.deleteObject(bucketName, s3Key);
                removePendingUpload(s3Key);
                throw new InvalidImageRequestException("File size exceeds configured limit");
            }
        } catch (NoSuchKeyException ex) {
            throw new ImageNotFoundException();
        } catch (S3Exception ex) {
            if (ex.statusCode() == 404) {
                throw new ImageNotFoundException();
            }
            throw ex;
        }
    }

    // Нормализация + валидация content-type
    private String normalizeContentType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            throw new InvalidImageRequestException("contentType is required");
        }

        String normalized = contentType.trim().toLowerCase(Locale.ROOT);
        if (!ALLOWED_CONTENT_TYPES.containsKey(normalized)) {
            throw new InvalidImageRequestException("Unsupported contentType: " + contentType);
        }
        return normalized;
    }

    // Сохранение ключа в Redis как ожидающий подтверждения
    private void savePendingUpload(String s3Key) {
        Duration ttl = Duration.ofHours(pendingUploadTtlHours);
        long expiresAtEpochSecond = Instant.now().plus(ttl).getEpochSecond();
        redisTemplate.opsForZSet().add(PENDING_UPLOAD_INDEX_KEY, s3Key, expiresAtEpochSecond);
    }

    //Валидация автора
    private void validateOwnership(UUID userId, String s3Key) {
        if (s3Key == null || s3Key.isBlank()) {
            throw new InvalidImageRequestException("key is required");
        }
        String keyPrefix = "receipts/" + userId + "/";
        if (!s3Key.startsWith(keyPrefix)) {
            throw new ImageAccessDeniedException();
        }
    }

    // Удаление просроченных и неиспользованных ключей из Redis и MinIO
    private void cleanupExpiredPendingUploads() {
        long nowEpochSecond = Instant.now().getEpochSecond();
        Set<String> expiredKeys = redisTemplate.opsForZSet().rangeByScore(
                PENDING_UPLOAD_INDEX_KEY,
                Double.NEGATIVE_INFINITY,
                nowEpochSecond,
                0,
                cleanupBatchSize
        );

        if (expiredKeys == null || expiredKeys.isEmpty()) {
            return;
        }

        for (String s3Key : expiredKeys) {
            try {
                if (s3Template.objectExists(bucketName, s3Key)) {
                    s3Template.deleteObject(bucketName, s3Key);
                    log.info("Removed expired orphan image, key={}", s3Key);
                }
            } catch (Exception ex) {
                log.warn("Failed to cleanup pending image key={}", s3Key, ex);
            } finally {
                removePendingUpload(s3Key);
            }
        }
    }

    // Безопасный запуск cleanup без проброса исключений наружу
    public void cleanupExpiredPendingUploadsSafe() {
        try {
            cleanupExpiredPendingUploads();
        } catch (Exception ex) {
            log.warn("Failed to cleanup expired pending uploads", ex);
        }
    }

    // Удаление ключа из pending-индекса Redis
    private void removePendingUpload(String s3Key) {
        try {
            redisTemplate.opsForZSet().remove(PENDING_UPLOAD_INDEX_KEY, s3Key);
        } catch (Exception ex) {
            log.warn("Failed to remove pending upload key={}", s3Key, ex);
        }
    }
}
