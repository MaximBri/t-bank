package com.tbank.tevent.expenses.dto;

import com.tbank.tevent.expenses.ExpenseStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record ExpenseDto(
        UUID id,
        String title,
        String category,
        ExpenseStatus status,
        UUID payerId,
        Integer splitBetweenCount,
        LocalDateTime createdAt,
        Double totalAmount,
        Double perPersonAmount,
        String disputeInfo,
        String checkUrl
) {
}
