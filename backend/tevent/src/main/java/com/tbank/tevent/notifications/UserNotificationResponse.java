package com.tbank.tevent.notifications;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserNotificationResponse(
        UUID id,
        UUID eventId,
        UUID expenseId,
        String title,
        String message,
        Boolean isRead,
        LocalDateTime createdAt
) {}
