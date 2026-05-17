package com.tbank.tevent.event;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record EventResponse (
    UUID id,
    String title,
    String description,
    LocalDateTime startDate,
    LocalDateTime endDate,
    List<String> categories,
    String status,
    String imageKey,
    UUID ownerId,
    Long countOfParticipants
){}
