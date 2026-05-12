package com.tbank.tevent.profile.dto;


public record UpdateProfileRequest(
        String firstName,
        String secondName,
        String username
) {}
