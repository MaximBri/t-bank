package com.tbank.tevent.profile.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordChangeRequest (
        @NotBlank @Size(min = 8) String currentPassword,
        @NotBlank @Size(min = 8) String newPassword
) {}
