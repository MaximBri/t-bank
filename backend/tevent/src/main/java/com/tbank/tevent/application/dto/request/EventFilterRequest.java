package com.tbank.tevent.application.dto.request;

/**
 * DTO для фильтрации событий пользователя
 */
public record EventFilterRequest(
    Integer minParticipants,
    Integer maxParticipants
) {
    
    public EventFilterRequest {
        if (minParticipants != null && minParticipants < 0) {
            throw new IllegalArgumentException("minParticipants cannot be negative");
        }
        if (maxParticipants != null && maxParticipants < 1) {
            throw new IllegalArgumentException("maxParticipants must be positive");
        }
        if (minParticipants != null && maxParticipants != null && minParticipants > maxParticipants) {
            throw new IllegalArgumentException("minParticipants cannot be greater than maxParticipants");
        }
    }
    
    /**
     * Проверка, применен ли фильтр по количеству участников
     */
    public boolean hasParticipantsFilter() {
        return minParticipants != null || maxParticipants != null;
    }
}