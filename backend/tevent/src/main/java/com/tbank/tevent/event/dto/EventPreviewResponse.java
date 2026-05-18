package com.tbank.tevent.event.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record EventPreviewResponse(
    UUID eventId,
    String title,
    String imageUrl,
    Long participantCount,
    LocalDateTime startDate,
    LocalDateTime endDate,
    CreatorInfo creatorInfo
) {
    public EventPreviewResponse {
        if (creatorInfo == null) {
            throw new IllegalArgumentException("creatorInfo cannot be null");
        }
    }
}