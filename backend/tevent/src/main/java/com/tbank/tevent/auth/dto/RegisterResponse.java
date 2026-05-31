package com.tbank.tevent.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

public record RegisterResponse(
        @JsonProperty("user_id") UUID userId,
        @JsonProperty("joined_group_id") UUID joinedGroupId
) {}
