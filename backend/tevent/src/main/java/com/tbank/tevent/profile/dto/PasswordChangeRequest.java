package com.tbank.tevent.profile.dto;


import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordChangeRequest (
        @NotBlank @Size(min = 8) @JsonProperty("current_password") String currentPassword,
        @NotBlank @Size(min = 8) @JsonProperty("new_password") String newPassword
) {}
