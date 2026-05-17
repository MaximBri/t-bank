package com.tbank.tevent.s3.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateImageUploadUrlRequest(
        @NotBlank @Size(max = 255) @JsonProperty("file_name") String fileName,
        @NotBlank @Size(max = 100) @JsonProperty("content_type") String contentType
) {
}
