package com.tbank.tevent.application.dto.request;

import com.tbank.tevent.domain.model.ExpenseCategory;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.util.List;

/**
 * Запрос на создание расхода.
 */
@Schema(description = "Запрос на создание расхода")
public record CreateExpenseRequest(
        @NotBlank(message = "Название расхода обязательно")
        @Size(min = 3, max = 255, message = "Название должно быть от 3 до 255 символов")
        @Schema(description = "Название расхода", example = "Аренда машины")
        String title,

        @NotNull(message = "Сумма расхода обязательна")
        @Positive(message = "Сумма должна быть положительной")
        @Schema(description = "Сумма расхода", example = "15000.00")
        Double amount,

        @NotNull(message = "Категория расхода обязательна")
        @Schema(description = "Категория расхода", example = "TRANSPORT")
        ExpenseCategory category,

        @NotNull(message = "Список участников обязателен")
        @Size(min = 1, message = "Должен быть хотя бы один участник")
        @Schema(description = "ID участников, между которыми будет разделена сумма расхода", 
                example = "[15, 23, 42]")
        List<Integer> participantIds,

        @Schema(description = "Ключ чека в MinIO", example = "receipts/event_42/uuid.jpg")
        String imageKey
) {}