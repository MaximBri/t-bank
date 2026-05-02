package com.tbank.tevent.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;

/**
 * Запрос на обновление профиля пользователя.
 */
@Schema(description = "Запрос на обновление профиля пользователя")
public record UpdateProfileRequest(
        @Schema(description = "Имя")
        String firstName,

        @Schema(description = "Фамилия")
        String lastName,

        @Email(message = "Некорректный формат email")
        @Schema(description = "Email пользователя (можно редактировать, так как не задается при регистрации)")
        String email
) {}