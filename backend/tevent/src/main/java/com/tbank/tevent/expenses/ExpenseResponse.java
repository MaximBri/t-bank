package com.tbank.tevent.expenses;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ExpenseResponse(
        UUID id,
        String title,
        String description,
        BigDecimal totalAmount,
        UUID payerId,
        String status,
        String imageKey,
        List<String> categories,
        List<UUID> firstTenParticipants,
        int totalParticipantsCount,
        LocalDateTime createdAt
) {}
