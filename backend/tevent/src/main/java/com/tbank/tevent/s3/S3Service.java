package com.tbank.tevent.s3;

import com.tbank.tevent.s3.exception.ImageAccessDeniedException;
import com.tbank.tevent.s3.exception.ImageNotFoundException;
import com.tbank.tevent.s3.exception.InvalidImageRequestException;
import io.awspring.cloud.s3.ObjectMetadata;
import io.awspring.cloud.s3.S3Template;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.time.Duration;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private static final Map<String, String> ALLOWED_CONTENT_TYPES = Map.of(
            "image/jpeg", "jpg",
            "image/jpg", "jpg",
            "image/png", "png",
            "image/webp", "webp"
    );

    private final S3Template s3Template;

    @Value("${spring.cloud.aws.s3.bucket-name:tbank-receipts}")
    private String bucketName;

    @Value("${app.s3.presign-ttl-minutes:15}")
    private long presignTtlMinutes;

    public PresignedUpload generateUploadUrl(UUID userId, String fileName, String contentType) {
        String normalizedContentType = normalizeContentType(contentType);
        String normalizedFileName = normalizeFileName(fileName);
        String extension = ALLOWED_CONTENT_TYPES.get(normalizedContentType);
        String key = String.format("receipts/%s/%s.%s", userId, UUID.randomUUID(), extension);

        ObjectMetadata objectMetadata = ObjectMetadata.builder()
                .contentType(normalizedContentType)
                .contentDisposition("inline; filename=\"" + normalizedFileName + "\"")
                .build();

        URL url = s3Template.createSignedPutURL(
                bucketName,
                key,
                Duration.ofMinutes(presignTtlMinutes),
                objectMetadata,
                "PUT"
        );

        log.info("Generated presigned upload URL, userId={}, key={}", userId, key);
        return new PresignedUpload(key, url.toString(), presignTtlMinutes * 60);
    }

    public String generateDownloadUrl(UUID userId, String s3Key) {
        validateOwnership(userId, s3Key);
        if (!s3Template.objectExists(bucketName, s3Key)) {
            throw new ImageNotFoundException();
        }

        URL url = s3Template.createSignedGetURL(
                bucketName,
                s3Key,
                Duration.ofMinutes(presignTtlMinutes)
        );

        log.info("Generated presigned download URL, userId={}, key={}", userId, s3Key);
        return url.toString();
    }

    public void deleteFile(UUID userId, String s3Key) {
        validateOwnership(userId, s3Key);
        s3Template.deleteObject(bucketName, s3Key);
        log.info("Deleted object from s3, userId={}, key={}", userId, s3Key);
    }

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

    private String normalizeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            throw new InvalidImageRequestException("fileName is required");
        }

        String normalized = fileName.trim()
                .replace("\\", "_")
                .replace("/", "_");

        if (normalized.length() > 255) {
            normalized = normalized.substring(0, 255);
        }

        return normalized;
    }

    private void validateOwnership(UUID userId, String s3Key) {
        if (s3Key == null || s3Key.isBlank()) {
            throw new InvalidImageRequestException("key is required");
        }

        String keyPrefix = "receipts/" + userId + "/";
        if (!s3Key.startsWith(keyPrefix)) {
            throw new ImageAccessDeniedException();
        }
    }

    public record PresignedUpload(String imageKey, String uploadUrl, long expiresInSeconds) {
    }
}
