package com.tbank.tevent.s3.dto;

public record PresignedUpload(
        String imageKey,
        String uploadUrl,
        long expiresInSeconds
) {}
