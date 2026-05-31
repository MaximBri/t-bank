package com.tbank.tevent.s3.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DownloadUrlResponse(
        @JsonProperty("download_url") String downloadUrl
) {}
