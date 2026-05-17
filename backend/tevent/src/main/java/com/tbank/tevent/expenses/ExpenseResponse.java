package com.tbank.tevent.expenses;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ExpenseResponse(
        UUID id,
        String description,
        String title,
        BigDecimal totalAmount,
        UUID payerId,
        String status,
        List<String> categories,
        List<UUID> firstTenParticipants,
        int totalParticipantsCount,
        LocalDateTime createdAt
) {}
