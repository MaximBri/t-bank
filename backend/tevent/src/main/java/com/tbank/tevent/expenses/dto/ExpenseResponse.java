package com.tbank.tevent.expenses.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ExpenseResponse(
        UUID id,
        String title,
        String description,
        @JsonProperty("total_amount") BigDecimal totalAmount,
        @JsonProperty("payer_id") UUID payerId,
        String status,
        @JsonProperty("image_key") String imageKey,
        List<String> categories,
        @JsonProperty("first_ten_participants") List<UUID> firstTenParticipants,
        @JsonProperty("total_participants_count") int totalParticipantsCount,
        @JsonProperty("created_at") LocalDateTime createdAt
) {}
