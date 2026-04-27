package com.tbank.tevent.domain.model;

/**
 * Категории событий
 */
public enum EventCategory {
    TRAVEL("Путешествия"),
    FOOD("Еда и рестораны"),
    PARTY("Вечеринки и мероприятия"),
    RENT("Аренда и жилье"),
    OTHER("Другое");
    
    private final String displayName;
    
    EventCategory(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    /**
     * Получение категории по строковому значению (игнорируя регистр)
     */
    public static EventCategory fromString(String value) {
        if (value == null) {
            return null;
        }
        try {
            return EventCategory.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}