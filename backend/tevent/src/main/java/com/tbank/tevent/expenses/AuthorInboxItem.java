package com.tbank.tevent.expenses;

import java.util.UUID;

public record AuthorInboxItem(
        UUID expenseId,
        UUID eventId,
        String description,
        String title,
        String status
) {}
