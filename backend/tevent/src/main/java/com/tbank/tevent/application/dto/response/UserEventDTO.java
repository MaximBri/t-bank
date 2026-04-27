package com.tbank.tevent.application.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.tbank.tevent.domain.model.EventStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

/**
 * DTO для отображения события в списке пользователя (например, на дашборде).
 */
@Schema(description = "DTO для отображения события в списке пользователя")
public record UserEventDTO(
        @Schema(description = "ID события", example = "42")
        Integer id,

        @Schema(description = "Название события", example = "Майские в Питере")
        String title,

        @JsonFormat(pattern = "yyyy-MM-dd")
        @Schema(description = "Дата начала события", example = "2026-05-01")
        LocalDate startDate,

        @JsonFormat(pattern = "yyyy-MM-dd")
        @Schema(description = "Дата окончания события", example = "2026-05-05")
        LocalDate endDate,

        @Schema(description = "Количество подтвержденных участников", example = "4")
        Integer participantsCount,

        @Schema(description = "Статус события")
        EventStatus status,

        @Schema(description = "Временная или проксированная ссылка на обложку в MinIO", 
                example = "https://s3.t-event.ru/events/pic_123.jpg?X-Amz-Signature=...")
        String imageUrl
) {}