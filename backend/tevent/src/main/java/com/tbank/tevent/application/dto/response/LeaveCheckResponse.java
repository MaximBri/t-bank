package com.tbank.tevent.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Ответ на проверку возможности выхода из события.
 */
@Schema(description = "Ответ на проверку возможности выхода из события")
public record LeaveCheckResponse(
        @Schema(description = "true, если долгов нет и роль позволяет выйти", example = "true")
        Boolean canLeave,

        @Schema(description = "Текст ошибки, если canLeave = false", 
                example = "У вас есть 2 непогашенных долга", nullable = true)
        String reason,

        @Schema(description = "Есть ли долги", example = "false")
        Boolean hasDebts,

        @Schema(description = "Является ли пользователь владельцем события", example = "false")
        Boolean isOwner
) {}