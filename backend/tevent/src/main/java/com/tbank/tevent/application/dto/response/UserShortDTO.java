package com.tbank.tevent.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Краткий DTO пользователя.
 */
@Schema(description = "Краткий DTO пользователя")
public record UserShortDTO(
        @Schema(description = "ID пользователя", example = "15")
        Integer id,

        @Schema(description = "Полное имя", example = "Мария Сидорова")
        String fullName,

        @Schema(description = "URL аватара")
        String avatarUrl,

        @Schema(description = "Инициалы", example = "М.С.")
        String initials
) {}