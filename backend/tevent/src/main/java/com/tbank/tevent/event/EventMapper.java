package com.tbank.tevent.event;

import com.tbank.tevent.category.dto.CategoryResponse;
import com.tbank.tevent.event.dto.CreatorInfo;
import com.tbank.tevent.event.dto.EventResponse;
import com.tbank.tevent.repo.entity.Event;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EventMapper {
    public EventResponse mapToResponse(Event event, List<CategoryResponse> categories, Long count, CreatorInfo creatorInfo) {
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
                event.getState(),
                event.getImageKey(),
                event.getOwnerId(),
                count,
                creatorInfo
                );
    }
}
