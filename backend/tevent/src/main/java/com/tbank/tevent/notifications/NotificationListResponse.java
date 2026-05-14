package com.tbank.tevent.notifications;

import java.util.List;

public record NotificationListResponse(
        List<UserNotificationResponse> items,
        long unreadCount
) {}
