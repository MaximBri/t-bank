package com.tbank.tevent.application.dto.response;

import com.tbank.tevent.domain.model.EventCategory;
import com.tbank.tevent.domain.model.EventStatus;

import java.time.Instant;
import java.util.List;

/**
 * DTO для ответа с информацией о событии
 */
public record EventResponse(
    Long id,
    String title,
    String description,
    Instant startDate,
    Instant endDate,
    List<EventCategory> category,
    EventStatus status,
    String imageUrl,
    Long ownerId,
    Instant createdAt,
    Instant updatedAt
) {
    
    public EventResponse {
        if (id == null) {
            throw new IllegalArgumentException("Event ID cannot be null");
        }
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Title cannot be null or blank");
        }
        if (category == null) {
            category = List.of();
        }
    }
    
    public EventResponse(Long id, String title, String description, Instant startDate, 
                        Instant endDate, List<EventCategory> category, EventStatus status, 
                        Long ownerId) {
        this(id, title, description, startDate, endDate, category, status, null, ownerId, null, null);
    }
}