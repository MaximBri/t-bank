package com.tbank.tevent.expenses;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateExpenseRequest(
        @NotBlank
        String title,
        String description,
        @JsonAlias({"amount", "total_amount"}) BigDecimal totalAmount,
        @JsonProperty("image_key") @JsonAlias({"imageUrl", "image_url"}) String imageKey,
        @JsonProperty("categories") @JsonAlias("category") List<String> categories,
        List<UUID> participantIds
) {}
