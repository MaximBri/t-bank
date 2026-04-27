package com.tbank.tevent.domain.model;

import java.time.Instant;

/**
 * Статусы событий
 */
public enum EventStatus {
    PLANNED("Запланировано"),
    ACTIVE("Активно"),
    COMPLETED("Завершено");
    
    private final String displayName;
    
    EventStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    /**
     * Расчет статуса события на основе дат
     * 
     * @param startDate дата начала
     * @param endDate дата окончания
     * @param now текущее время (для тестирования)
     * @return рассчитанный статус
     */
    public static EventStatus calculateStatus(Instant startDate, Instant endDate, Instant now) {
        if (now == null) {
            now = Instant.now();
        }
        
        if (startDate == null || endDate == null) {
            return PLANNED;
        }
        
        if (now.isBefore(startDate)) {
            return PLANNED;
        } else if (now.isAfter(endDate)) {
            return COMPLETED;
        } else {
            return ACTIVE;
        }
    }
    
    /**
     * Расчет статуса события на основе дат (использует текущее время)
     */
    public static EventStatus calculateStatus(Instant startDate, Instant endDate) {
        return calculateStatus(startDate, endDate, Instant.now());
    }
    
    /**
     * Получение статуса по строковому значению (игнорируя регистр)
     */
    public static EventStatus fromString(String value) {
        if (value == null) {
            return null;
        }
        try {
            return EventStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
    
    /**
     * Проверка, является ли статус завершенным
     */
    public boolean isCompleted() {
        return this == COMPLETED;
    }
    
    /**
     * Проверка, является ли статус активным
     */
    public boolean isActive() {
        return this == ACTIVE;
    }
    
    /**
     * Проверка, является ли статус запланированным
     */
    public boolean isPlanned() {
        return this == PLANNED;
    }
}