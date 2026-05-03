package com.tbank.tevent.expenses.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateExpenseRequest(
        @NotBlank @Size(max = 1000) String title,
        @NotNull @Positive BigDecimal amount,
        @NotBlank @Size(max = 255) String category,
        @NotEmpty List<UUID> participantIds,
        @NotBlank @Size(max = 500) String imageKey
) {}
