package com.tbank.tevent.category.dto;

import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        UUID eventId
) {}
