package com.tbank.tevent.application.dto.request;

import com.tbank.tevent.domain.model.EventCategory;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

/**
 * DTO для запроса обновления события
 * Все поля опциональны - обновляются только переданные поля
 */
public record UpdateEventRequest(
    
    @Size(min = 3, max = 200, message = "Название события должно быть от 3 до 200 символов")
    String title,
    
    @Size(max = 1000, message = "Описание не может превышать 1000 символов")
    String description,
    
    Instant startDate,
    
    Instant endDate,
    
    List<EventCategory> category,
    
    String imageKey
) {
    
    public UpdateEventRequest {
        if (endDate != null && startDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("Дата окончания не может быть раньше даты начала");
        }
    }
    
    /**
     * Проверка, является ли запрос пустым (не содержит изменений)
     */
    public boolean isEmpty() {
        return title == null && description == null && startDate == null && 
               endDate == null && category == null && imageKey == null;
    }
}