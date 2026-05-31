package com.tbank.tevent.s3.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UploadUrlResponse(
        @JsonProperty("image_key") String imageKey,
        @JsonProperty("upload_url") String uploadUrl,
        @JsonProperty("expires_in_seconds") long expiresInSeconds
) {}
