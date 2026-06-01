package com.tbank.tevent.expenses.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateExpenseRequest(
        @NotBlank String title,
        String description,
        @JsonProperty("total_amount") @NotNull @Positive BigDecimal totalAmount,
        @JsonProperty("image_key") @JsonAlias("image_url") String imageKey,
        @NotEmpty List<String> categories,
        @JsonProperty("participant_ids") @NotEmpty List<UUID> participantIds
) {}
