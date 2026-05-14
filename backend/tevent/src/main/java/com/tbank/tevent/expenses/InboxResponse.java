package com.tbank.tevent.expenses;

import java.util.List;

public record InboxResponse(
        List<ParticipantInboxItem> pendingConfirmations,
        List<AuthorInboxItem> actionRequired
) {}
