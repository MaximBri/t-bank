package com.tbank.tevent.expenses;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateExpenseRequest(
        @NotBlank
        String title,
        String description,
        BigDecimal totalAmount,
        @JsonAlias("imageUrl") String imageKey,
        List<String> categories,
        List<UUID> participantIds
) {}
