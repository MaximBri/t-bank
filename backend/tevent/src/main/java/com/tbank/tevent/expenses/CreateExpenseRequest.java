package com.tbank.tevent.expenses;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateExpenseRequest(
        @NotBlank
        String title,
        String description,
        BigDecimal totalAmount,
        String imageUrl,
        List<String> categories,
        List<UUID> participantIds
) {}
