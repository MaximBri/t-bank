package com.tbank.tevent.auth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @JsonAlias("username") @NotBlank @Size(max = 255) String login,
        @NotBlank @Size(max = 255) String password
) {}
