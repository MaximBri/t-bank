package com.tbank.tevent.event;

import com.tbank.tevent.category.dto.CategoryResponse;
import com.tbank.tevent.repo.entity.Event;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EventMapper {
    public EventResponse mapToResponse(Event event, List<CategoryResponse> categories, Long count) {
        List<String> eventCategoryNames = categories.stream()
                .filter(c -> event.getId().equals(c.eventId()))
                .map(CategoryResponse::name)
                .toList();
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getStartDate(),
                event.getEndDate(),
                eventCategoryNames,
                EventStatusCalculator.calculate(event.getStartDate(), event.getEndDate()),
                event.getImageKey(),
                event.getOwnerId(),
                count
        );
    }
}
