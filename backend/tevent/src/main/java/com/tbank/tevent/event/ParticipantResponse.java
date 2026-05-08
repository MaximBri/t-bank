package com.tbank.tevent.event;

import java.time.LocalDateTime;
import java.util.UUID;

public record ParticipantResponse(
        UUID userId,
        String login,
        String firstName,
        String lastName
) {}
