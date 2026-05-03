package com.tbank.tevent.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

public record CurrentUserResponse(
        String login,
        @JsonProperty("user_id") UUID userId,
        @JsonProperty("first_name") String firstName,
        @JsonProperty("second_name") String secondName,
        @JsonProperty("avatar_url") String avatarUrl
) {}
