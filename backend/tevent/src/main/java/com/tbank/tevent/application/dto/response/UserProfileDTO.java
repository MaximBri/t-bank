package com.tbank.tevent.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO профиля пользователя.
 */
@Schema(description = "DTO профиля пользователя")
public record UserProfileDTO(
        @Schema(description = "Имя", example = "Иван")
        String firstName,

        @Schema(description = "Фамилия", example = "Петров")
        String lastName,

        @Schema(description = "Имя пользователя", example = "@username")
        String username,

        @Schema(description = "Email", example = "ivan.petrov@example.com")
        String email,

        @Schema(description = "URL аватара")
        String avatarUrl
) {}