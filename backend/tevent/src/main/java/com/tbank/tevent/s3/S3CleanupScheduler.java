package com.tbank.tevent.s3;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class S3CleanupScheduler {

    private final S3Service s3Service;

    @Scheduled(fixedDelayString = "${app.s3.cleanup-fixed-delay-ms:900000}")
    public void cleanupPendingUploads() {
        s3Service.cleanupExpiredPendingUploadsSafe();
    }
}
