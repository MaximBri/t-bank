package com.tbank.tevent.event.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

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
    @JsonProperty("image_key")
    String imageUrl,
    UUID ownerId,
    Long countOfParticipants,
    CreatorInfo creatorInfo
){}
