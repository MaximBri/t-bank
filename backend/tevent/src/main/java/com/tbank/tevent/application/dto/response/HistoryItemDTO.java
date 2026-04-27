package com.tbank.tevent.application.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.tbank.tevent.domain.model.HistoryItemType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/**
 * DTO элемента истории.
 */
@Schema(description = "DTO элемента истории")
public record HistoryItemDTO(
        @Schema(description = "ID элемента истории", example = "1001")
        Integer id,

        @Schema(description = "Заголовок действия", example = "Добавлен расход «Экскурсия по городу»")
        String title,

        @Schema(description = "Имя исполнителя", example = "Дмитрий Волков")
        String actorName,

        @Schema(description = "Текст в правой части (тип действия)", example = "Создание расхода")
        String actionLabel,

        @Schema(description = "Тип элемента истории")
        HistoryItemType type,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Schema(description = "Время действия", example = "2026-05-14T18:45:00Z")
        LocalDateTime timestamp
) {}