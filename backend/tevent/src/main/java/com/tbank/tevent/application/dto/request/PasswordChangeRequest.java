package com.tbank.tevent.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Запрос на изменение пароля.
 */
@Schema(description = "Запрос на изменение пароля")
public record PasswordChangeRequest(
        @NotBlank(message = "Текущий пароль обязателен")
        @Schema(description = "Текущий пароль", format = "password")
        String currentPassword,

        @NotBlank(message = "Новый пароль обязателен")
        @Size(min = 8, message = "Новый пароль должен содержать минимум 8 символов")
        @Schema(description = "Новый пароль", format = "password")
        String newPassword
) {}