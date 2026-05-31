package com.tbank.tevent.s3.unit;

import com.tbank.tevent.s3.S3Service;
import com.tbank.tevent.s3.dto.PresignedUpload;
import com.tbank.tevent.s3.exception.ImageAccessDeniedException;
import com.tbank.tevent.s3.exception.ImageNotFoundException;
import com.tbank.tevent.s3.exception.InvalidImageRequestException;
import io.awspring.cloud.s3.S3Template;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.net.URL;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class S3ServiceTest {

    private static final String PENDING_UPLOAD_INDEX_KEY = "s3:pending:index";

    @Mock
    private S3Template s3Template;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private S3Client s3Client;

    @Mock
    private ZSetOperations<String, String> zSetOperations;

    private S3Service service;

    @BeforeEach
    void setUp() {
        service = new S3Service(s3Template, redisTemplate, s3Client);
        lenient().when(redisTemplate.opsForZSet()).thenReturn(zSetOperations);

        ReflectionTestUtils.setField(service, "bucketName", "test-bucket");
        ReflectionTestUtils.setField(service, "presignTtlMinutes", 15L);
        ReflectionTestUtils.setField(service, "pendingUploadTtlHours", 1L);
        ReflectionTestUtils.setField(service, "cleanupBatchSize", 100);
        ReflectionTestUtils.setField(service, "maxFileSizeBytes", 3_145_728L);
    }

    @Test
    // Проверка: generateUploadUrl нормализует content-type, генерирует ключ и регистрирует pending key
    void generateUploadUrlBuildsPresignedUploadAndStoresPendingKey() throws Exception {
        UUID userId = UUID.randomUUID();
        when(s3Template.createSignedPutURL(anyString(), anyString(), any(), any(), anyString()))
                .thenReturn(new URL("https://example.com/upload"));

        PresignedUpload upload = service.generateUploadUrl(userId, "IMAGE/JPEG", 1024L);

        assertThat(upload.uploadUrl()).isEqualTo("https://example.com/upload");
        assertThat(upload.expiresInSeconds()).isEqualTo(900);
        assertThat(upload.imageKey()).startsWith("receipts/" + userId + "/");
        assertThat(upload.imageKey()).endsWith(".jpg");

        verify(s3Template).createSignedPutURL(anyString(), anyString(), any(), any(), anyString());
        verify(zSetOperations).add(eq(PENDING_UPLOAD_INDEX_KEY), eq(upload.imageKey()), anyDouble());
    }

    @Test
    // Проверка: generateUploadUrl отклоняет неподдерживаемый content-type
    void generateUploadUrlRejectsUnsupportedContentType() {
        UUID userId = UUID.randomUUID();

        assertThatThrownBy(() -> service.generateUploadUrl(userId, "text/plain", 100L))
                .isInstanceOf(InvalidImageRequestException.class);
    }

    @Test
    // Проверка: generateUploadUrl отклоняет file_size_bytes <= 0.
    void generateUploadUrlRejectsNonPositiveFileSize() {
        UUID userId = UUID.randomUUID();

        assertThatThrownBy(() -> service.generateUploadUrl(userId, "image/png", 0L))
                .isInstanceOf(InvalidImageRequestException.class);
    }

    @Test
    // Проверка: generateUploadUrl отклоняет большой файл
    void generateUploadUrlRejectsTooLargeFileSize() {
        UUID userId = UUID.randomUUID();

        assertThatThrownBy(() -> service.generateUploadUrl(userId, "image/png", 10_000_000L))
                .isInstanceOf(InvalidImageRequestException.class);
    }

    @Test
    // Проверка: generateDownloadUrl возвращает null для пустого ключа
    void generateDownloadUrlReturnsNullForBlankKey() {
        assertThat(service.generateDownloadUrl(" ")).isNull();
    }

    @Test
    // Проверка: generateDownloadUrl возвращает null, если объект не существует
    void generateDownloadUrlReturnsNullWhenObjectMissing() {
        when(s3Template.objectExists("test-bucket", "receipts/u/file.png")).thenReturn(false);

        assertThat(service.generateDownloadUrl("receipts/u/file.png")).isNull();
    }

    @Test
    // Проверка: generateDownloadUrl возвращает URL для существующего объекта
    void generateDownloadUrlReturnsSignedUrlWhenObjectExists() throws Exception {
        when(s3Template.objectExists("test-bucket", "receipts/u/file.png")).thenReturn(true);
        when(s3Template.createSignedGetURL(anyString(), anyString(), any()))
                .thenReturn(new URL("https://example.com/download"));

        String url = service.generateDownloadUrl("receipts/u/file.png");

        assertThat(url).isEqualTo("https://example.com/download");
    }

    @Test
    // Проверка: deleteFile отклоняет удаление чужого ключа
    void deleteFileRejectsForeignKey() {
        UUID userId = UUID.randomUUID();

        assertThatThrownBy(() -> service.deleteFile(userId, "receipts/another-user/file.png"))
                .isInstanceOf(ImageAccessDeniedException.class);

        verify(s3Template, never()).deleteObject(anyString(), anyString());
    }

    @Test
    // Проверка: deleteFile отклоняет пустой ключ
    void deleteFileRejectsBlankKey() {
        UUID userId = UUID.randomUUID();

        assertThatThrownBy(() -> service.deleteFile(userId, " "))
                .isInstanceOf(InvalidImageRequestException.class);

        verify(s3Template, never()).deleteObject(anyString(), anyString());
    }

    @Test
    // Проверка: deleteFile удаляет объект и убирает ключ из pending индекса
    void deleteFileDeletesObjectAndRemovesPendingKey() {
        UUID userId = UUID.randomUUID();
        String key = "receipts/" + userId + "/file.png";

        service.deleteFile(userId, key);

        verify(s3Template).deleteObject("test-bucket", key);
        verify(zSetOperations).remove(PENDING_UPLOAD_INDEX_KEY, key);
    }

    @Test
    // Проверка: useKey игнорирует ключи вне receipts/ и не ходит в S3
    void useKeyIgnoresNonReceiptsKeys() {
        service.useKey("avatars/u/file.png");

        verify(s3Client, never()).headObject(any(HeadObjectRequest.class));
    }

    @Test
    // Проверка: useKey удаляет pending key для валидного объекта
    void useKeyRemovesPendingKeyForValidObject() {
        String key = "receipts/u/file.png";
        when(s3Client.headObject(any(HeadObjectRequest.class)))
                .thenReturn(HeadObjectResponse.builder().contentLength(1024L).build());

        service.useKey(key);

        verify(zSetOperations).remove(PENDING_UPLOAD_INDEX_KEY, key);
        verify(s3Template, never()).deleteObject(anyString(), anyString());
    }

    @Test
    // Проверка: useKey выбрасывает exception и удаляет объект при превышении лимита
    void useKeyDeletesObjectWhenActualSizeExceedsLimit() {
        String key = "receipts/u/file.png";
        when(s3Client.headObject(any(HeadObjectRequest.class)))
                .thenReturn(HeadObjectResponse.builder().contentLength(10_000_000L).build());

        assertThatThrownBy(() -> service.useKey(key))
                .isInstanceOf(InvalidImageRequestException.class);

        verify(s3Template).deleteObject("test-bucket", key);
        verify(zSetOperations).remove(PENDING_UPLOAD_INDEX_KEY, key);
    }

    @Test
    // Проверка: useKey пробрасывает ImageNotFoundException при отсутствии объекта в S3
    void useKeyThrowsImageNotFoundWhenObjectMissing() {
        String key = "receipts/u/file.png";
        when(s3Client.headObject(any(HeadObjectRequest.class)))
                .thenThrow(NoSuchKeyException.builder().build());

        assertThatThrownBy(() -> service.useKey(key))
                .isInstanceOf(ImageNotFoundException.class);
    }

    @Test
    // Проверка: useKey пробрасывает ImageNotFoundException при S3 404
    void useKeyThrowsImageNotFoundForS3Status404() {
        String key = "receipts/u/file.png";
        when(s3Client.headObject(any(HeadObjectRequest.class)))
                .thenThrow(S3Exception.builder().statusCode(404).build());

        assertThatThrownBy(() -> service.useKey(key))
                .isInstanceOf(ImageNotFoundException.class);
    }

    @Test
    // Проверка: cleanupExpiredPendingUploadsSafe удаляет просроченные объекты и ключи
    void cleanupExpiredPendingUploadsSafeDeletesExpiredPendingUploads() {
        String key1 = "receipts/u/1.png";
        String key2 = "receipts/u/2.png";
        when(zSetOperations.rangeByScore(anyString(), anyDouble(), anyDouble(), anyLong(), anyLong()))
                .thenReturn(Set.of(key1, key2));
        when(s3Template.objectExists("test-bucket", key1)).thenReturn(true);
        when(s3Template.objectExists("test-bucket", key2)).thenReturn(false);

        service.cleanupExpiredPendingUploadsSafe();

        verify(s3Template).deleteObject("test-bucket", key1);
        verify(zSetOperations).remove(PENDING_UPLOAD_INDEX_KEY, key1);
        verify(zSetOperations).remove(PENDING_UPLOAD_INDEX_KEY, key2);
    }

    @Test
    // Проверка: safe cleanup не бросает исключение при падении Redis
    void cleanupExpiredPendingUploadsSafeSwallowsExceptions() {
        when(zSetOperations.rangeByScore(anyString(), anyDouble(), anyDouble(), anyLong(), anyLong()))
                .thenThrow(new RuntimeException("redis down"));

        service.cleanupExpiredPendingUploadsSafe();
    }
}
