package com.tbank.tevent.event.dto;

import java.util.UUID;

public record ParticipantResponse(
        UUID userId,
        String login,
        String firstName,
        String lastName,
        String avatarUrl
) {}
