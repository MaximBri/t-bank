package com.tbank.tevent.history;

import java.time.LocalDateTime;
import java.util.UUID;

public record EventHistoryResponse(
        UUID id,
        UUID eventId,
        UUID userId,
        String userFullName,
        String actionType,
        String message,
        LocalDateTime createdAt
) {}
