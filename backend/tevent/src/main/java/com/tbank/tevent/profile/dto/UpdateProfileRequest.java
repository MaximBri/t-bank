package com.tbank.tevent.profile.dto;


import com.fasterxml.jackson.annotation.JsonProperty;

public record UpdateProfileRequest(
        @JsonProperty("first_name") String firstName,
        @JsonProperty("second_name") String secondName,
        String login
) {}
