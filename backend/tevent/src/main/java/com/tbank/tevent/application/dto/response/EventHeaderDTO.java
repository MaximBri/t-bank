package com.tbank.tevent.application.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.tbank.tevent.domain.model.EventStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO для заголовка события (используется на странице события).
 */
@Schema(description = "DTO для заголовка события")
public record EventHeaderDTO(
        @Schema(description = "Название события", example = "Поездка в Сочи")
        String title,

        @JsonFormat(pattern = "yyyy-MM-dd")
        @Schema(description = "Дата начала события", example = "2026-06-15")
        LocalDate startDate,

        @JsonFormat(pattern = "yyyy-MM-dd")
        @Schema(description = "Дата окончания события", example = "2026-06-20")
        LocalDate endDate,

        @Schema(description = "Статус события")
        EventStatus status,

        @Schema(description = "Количество участников", example = "5")
        Integer participantsCount,

        @Schema(description = "Pre-signed URL аватаров участников из MinIO")
        List<String> participantAvatars
) {}