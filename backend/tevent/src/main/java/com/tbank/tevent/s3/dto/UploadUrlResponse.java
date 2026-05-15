package com.tbank.tevent.s3.dto;

public record UploadUrlResponse(
        String imageKey,
        String uploadUrl,
        long expiresInSeconds
) {
}
