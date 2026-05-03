package com.tbank.tevent.category.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record CategoryDto(
        UUID id,
        String name,
        UUID eventId,
        LocalDateTime createdAt
) {}