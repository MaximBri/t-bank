package com.tbank.tevent.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO для ошибок API.
 */
@Schema(description = "DTO для ошибок API")
public record ErrorResponse(
        @Schema(description = "Код ошибки", example = "DEBTS_EXIST")
        String code,

        @Schema(description = "Сообщение об ошибке", example = "Нельзя покинуть группу с долгами.")
        String message,

        @Schema(description = "Дополнительные детали ошибки", nullable = true)
        Object details
) {}