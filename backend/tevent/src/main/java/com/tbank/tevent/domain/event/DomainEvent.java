package com.tbank.tevent.domain.event;

import java.time.Instant;
import java.util.UUID;

/**
 * Базовый интерфейс для всех доменных событий.
 * Доменные события представляют факты, которые произошли в системе.
 */
public interface DomainEvent {
    
    /**
     * Получение уникального идентификатора события
     * 
     * @return UUID события
     */
    UUID getEventId();
    
    /**
     * Получение времени возникновения события
     * 
     * @return момент времени
     */
    Instant getOccurredOn();
    
    /**
     * Получение типа события (для маршрутизации и сериализации)
     * 
     * @return тип события
     */
    String getEventType();
    
    /**
     * Получение агрегата, к которому относится событие
     * 
     * @return идентификатор агрегата
     */
    String getAggregateId();
    
    /**
     * Получение типа агрегата
     * 
     * @return тип агрегата
     */
    String getAggregateType();
    
    /**
     * Получение версии агрегата
     * 
     * @return версия
     */
    default Long getAggregateVersion() {
        return 1L;
    }
    
    /**
     * Получение метаданных события
     * 
     * @return метаданные (может быть null)
     */
    default EventMetadata getMetadata() {
        return null;
    }
    
    /**
     * Проверка, является ли событие важным (требует гарантированной доставки)
     * 
     * @return true если важно
     */
    default boolean isImportant() {
        return false;
    }
}