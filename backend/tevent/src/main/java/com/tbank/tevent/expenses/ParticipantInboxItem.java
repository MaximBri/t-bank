package com.tbank.tevent.expenses;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ParticipantInboxItem(
        UUID splitId,
        UUID expenseId,
        UUID eventId,
        String description,
        BigDecimal amountToPay,
        UUID payerId,
        String reason,
        LocalDateTime createdAt
) {}
