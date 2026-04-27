package com.tbank.tevent.application.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.tbank.tevent.domain.model.ExpenseApprovalStatus;
import com.tbank.tevent.domain.model.ExpenseCategory;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/**
 * DTO расхода.
 */
@Schema(description = "DTO расхода")
public record ExpenseDTO(
        @Schema(description = "ID расхода", example = "101")
        Integer id,

        @Schema(description = "Название расхода", example = "Бронирование отеля")
        String title,

        @Schema(description = "Категория расхода")
        ExpenseCategory category,

        @Schema(description = "Статус подтверждения")
        ExpenseApprovalStatus approvalStatus,

        @Schema(description = "Имя плательщика", example = "Иван Петров")
        String payerName,

        @Schema(description = "Количество участников, между которыми разделен расход", example = "5")
        Integer splitBetweenCount,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Schema(description = "Дата создания расхода")
        LocalDateTime createdAt,

        @Schema(description = "Общая сумма расхода", example = "45000.00")
        Double totalAmount,

        @Schema(description = "Сумма на человека", example = "9000.00")
        Double perPersonAmount,

        @Schema(description = "Информация о споре по расходу")
        DisputeInfo disputeInfo
) {
    /**
     * Информация о споре по расходу.
     */
    public record DisputeInfo(
            @Schema(description = "Причина спора", example = "Сумма указана неверно...")
            String reason,

            @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
            @Schema(description = "Время создания спора")
            LocalDateTime timestamp
    ) {}
}