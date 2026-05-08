package com.tbank.tevent.auth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @JsonAlias("login") @NotBlank @Size(max = 255) String login,
        @JsonAlias("invite_token") String inviteToken,
        @NotBlank @Size(max = 255) String password
) {}
