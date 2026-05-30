package com.tbank.tevent.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank @Size(max = 255) String login,
        @JsonProperty("invite_token") String inviteToken,
        @NotBlank @Size(max = 255) String password
) {}
