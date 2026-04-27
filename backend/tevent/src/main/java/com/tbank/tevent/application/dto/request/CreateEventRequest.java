package com.tbank.tevent.application.dto.request;

import com.tbank.tevent.domain.model.EventCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

/**
 * DTO для запроса создания события
 */
public record CreateEventRequest(
    
    @NotBlank(message = "Название события не может быть пустым")
    @Size(min = 3, max = 200, message = "Название события должно быть от 3 до 200 символов")
    String title,
    
    @Size(max = 1000, message = "Описание не может превышать 1000 символов")
    String description,
    
    @NotNull(message = "Дата начала обязательна")
    Instant startDate,
    
    @NotNull(message = "Дата окончания обязательна")
    Instant endDate,
    
    @NotNull(message = "Категории обязательны")
    @Size(min = 1, message = "Должна быть указана хотя бы одна категория")
    List<EventCategory> category,
    
    String imageKey
) {
    
    public CreateEventRequest {
        if (endDate != null && startDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("Дата окончания не может быть раньше даты начала");
        }
    }
}