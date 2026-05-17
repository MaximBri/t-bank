package com.tbank.tevent.profile.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserProfileDto(
        UUID id,
        String login,
        @JsonProperty("first_name") String firstName,
        @JsonProperty("second_name") String secondName,
        @JsonProperty("avatar_url") String avatarUrl,
        @JsonProperty("created_at") LocalDateTime createdAt,
        @JsonProperty("updated_at") LocalDateTime updatedAt
) {}