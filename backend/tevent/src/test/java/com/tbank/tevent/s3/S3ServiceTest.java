package com.tbank.tevent.s3;

import com.tbank.tevent.s3.exception.ImageAccessDeniedException;
import com.tbank.tevent.s3.exception.InvalidImageRequestException;
import io.awspring.cloud.s3.S3Template;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;

import java.net.URL;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class S3ServiceTest {

    @Mock
    private S3Template s3Template;
    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private ZSetOperations<String, String> zSetOperations;
    @Mock
    private S3Client s3Client;

    private S3Service s3Service;

    @BeforeEach
    void setUp() throws Exception {
        s3Service = new S3Service(s3Template, redisTemplate, s3Client);
        ReflectionTestUtils.setField(s3Service, "bucketName", "tbank-receipts");
        ReflectionTestUtils.setField(s3Service, "presignTtlMinutes", 15L);
        ReflectionTestUtils.setField(s3Service, "pendingUploadTtlHours", 1L);
        ReflectionTestUtils.setField(s3Service, "cleanupBatchSize", 100);
        ReflectionTestUtils.setField(s3Service, "maxFileSizeBytes", 3L * 1024 * 1024);

        lenient().when(redisTemplate.opsForZSet()).thenReturn(zSetOperations);
    }

    @Test
    void generateUploadUrlShouldRejectTooLargeExpectedSize() {
        UUID userId = UUID.randomUUID();

        assertThatThrownBy(() -> s3Service.generateUploadUrl(userId, "check", "image/jpeg", 3L * 1024 * 1024 + 1))
                .isInstanceOf(InvalidImageRequestException.class)
                .hasMessage("File size exceeds 3MB limit");
    }

    @Test
    void generateUploadUrlShouldCreatePresignedUrlAndJpgKey() throws Exception {
        UUID userId = UUID.randomUUID();
        when(s3Template.createSignedPutURL(anyString(), anyString(), any(), any(), anyString()))
                .thenReturn(new URL("http://localhost/upload"));

        S3Service.PresignedUpload result = s3Service.generateUploadUrl(userId, "receipt", "image/jpeg", 123L);

        assertThat(result.uploadUrl()).isEqualTo("http://localhost/upload");
        assertThat(result.expiresInSeconds()).isEqualTo(900);
        assertThat(result.imageKey()).startsWith("receipts/" + userId + "/").endsWith(".jpg");
        verify(zSetOperations).add(eq("s3:pending:index"), eq(result.imageKey()), anyDouble());
    }

    @Test
    void useKeyShouldIgnoreNonReceiptsKeys() {
        s3Service.useKey(UUID.randomUUID(), "http://example.com/image.jpg");

        verifyNoInteractions(s3Client);
    }

    @Test
    void useKeyShouldRejectForeignOwnership() {
        UUID userId = UUID.randomUUID();
        UUID anotherUserId = UUID.randomUUID();
        String key = "receipts/" + anotherUserId + "/image.jpg";

        assertThatThrownBy(() -> s3Service.useKey(userId, key))
                .isInstanceOf(ImageAccessDeniedException.class);
    }

    @Test
    void useKeyShouldDeleteOversizeObject() {
        UUID userId = UUID.randomUUID();
        String key = "receipts/" + userId + "/image.jpg";
        when(s3Client.headObject(any(software.amazon.awssdk.services.s3.model.HeadObjectRequest.class)))
                .thenReturn(HeadObjectResponse.builder().contentLength(4L * 1024 * 1024).build());

        assertThatThrownBy(() -> s3Service.useKey(userId, key))
                .isInstanceOf(InvalidImageRequestException.class)
                .hasMessage("File size exceeds 3MB limit");

        verify(s3Template).deleteObject("tbank-receipts", key);
        verify(zSetOperations).remove("s3:pending:index", key);
    }

    @Test
    void useKeyShouldRemovePendingForValidObject() {
        UUID userId = UUID.randomUUID();
        String key = "receipts/" + userId + "/image.jpg";
        when(s3Client.headObject(any(software.amazon.awssdk.services.s3.model.HeadObjectRequest.class)))
                .thenReturn(HeadObjectResponse.builder().contentLength(1024L).build());

        s3Service.useKey(userId, key);

        verify(zSetOperations).remove("s3:pending:index", key);
        ArgumentCaptor<software.amazon.awssdk.services.s3.model.HeadObjectRequest> captor =
                ArgumentCaptor.forClass(software.amazon.awssdk.services.s3.model.HeadObjectRequest.class);
        verify(s3Client).headObject(captor.capture());
        assertThat(captor.getValue().bucket()).isEqualTo("tbank-receipts");
        assertThat(captor.getValue().key()).isEqualTo(key);
    }
}
