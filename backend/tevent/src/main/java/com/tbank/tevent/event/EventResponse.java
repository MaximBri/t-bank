package com.tbank.tevent.event;

import com.tbank.tevent.event.dto.CreatorInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    String imageUrl,
    UUID ownerId,
    Long countOfParticipants,
    CreatorInfo creatorInfo
){}
