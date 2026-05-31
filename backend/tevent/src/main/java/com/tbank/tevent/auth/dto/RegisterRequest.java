package com.tbank.tevent.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 255) String login,
        @NotBlank @Size(min = 8, max = 255) String password,
        @JsonProperty("first_name") String firstName,
        @JsonProperty("second_name") String secondName,
        @JsonProperty("invite_token") String inviteToken
) {}
