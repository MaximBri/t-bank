package com.tbank.tevent.s3.unit;

import com.tbank.tevent.s3.S3CleanupScheduler;
import com.tbank.tevent.s3.S3Service;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class S3CleanupSchedulerTest {

    @Mock
    private S3Service s3Service;

    @Test
    // Проверка: делегация cleanup в сервис
    void cleanupPendingUploadsDelegatesToService() {
        S3CleanupScheduler scheduler = new S3CleanupScheduler(s3Service);

        scheduler.cleanupPendingUploads();

        verify(s3Service).cleanupExpiredPendingUploadsSafe();
    }
}
