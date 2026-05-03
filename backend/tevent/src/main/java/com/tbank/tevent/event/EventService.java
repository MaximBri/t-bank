package com.tbank.tevent.event;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.EventUserRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.EventUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventUserRepository eventUserRepository;

    @Transactional
    public EventResponse createEvent(CreateEventRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setOwnerId(currentUserId);
        event.setImageKey(request.getImageKey());

        event = eventRepository.save(event);

        EventUser eventUser = new EventUser();
        eventUser.setEventId(event.getId());
        eventUser.setUserId(currentUserId);
        eventUserRepository.save(eventUser);

        return mapToResponse(event);
    }

    @Transactional(readOnly = true)
    public EventResponse getEvent(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));
        checkAccess(event, SecurityUtils.getCurrentUserId());
        return mapToResponse(event);
    }

    @Transactional
    public EventResponse updateEvent(UUID eventId, UpdateEventRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (!event.getOwnerId().equals(currentUserId)) {
            throw new AccessDeniedException("Only owner can edit event");
        }

        if (request.getTitle() != null) event.setTitle(request.getTitle());
        if (request.getDescription() != null) event.setDescription(request.getDescription());
        if (request.getStartDate() != null) event.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) event.setEndDate(request.getEndDate());
        if (request.getImageKey() != null) event.setImageKey(request.getImageKey());

        eventRepository.save(event);
        return mapToResponse(event);
    }

    @Transactional(readOnly = true)
    public List<UserEventDTO> getUserEvents(String search,
                                            LocalDate startDate,
                                            LocalDate endDate,
                                            Integer minParticipants,
                                            Integer maxParticipants) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59) : null;

        List<Event> events = eventRepository.findUserEvents(
                currentUserId,
                search,
                startDateTime,
                endDateTime,
                minParticipants,
                maxParticipants
        );

        return events.stream()
                .map(event -> {
                    Long participantCount = eventUserRepository.countByEventId(event.getId());
                    return mapToUserEventDTO(event, participantCount.intValue());
                })
                .toList();
    }

    private EventResponse mapToResponse(Event event) {
        EventResponse resp = new EventResponse();
        resp.setId(event.getId());
        resp.setTitle(event.getTitle());
        resp.setDescription(event.getDescription());
        resp.setStartDate(event.getStartDate());
        resp.setStatus(EventStatusCalculator.calculate(event.getStartDate(), event.getEndDate()));
        resp.setImageUrl(null);
        resp.setOwnerId(event.getOwnerId());
        return resp;
    }

    private UserEventDTO mapToUserEventDTO(Event event, int participantsCount) {
        UserEventDTO dto = new UserEventDTO();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setStartDate(event.getStartDate().toLocalDate());
        dto.setEndDate(event.getEndDate().toLocalDate());
        dto.setParticipantsCount(participantsCount);
        dto.setStatus(EventStatusCalculator.calculate(event.getStartDate(), event.getEndDate()));
        dto.setImageUrl(null);
        return dto;
    }

    private void checkAccess(Event event, UUID userId) {
        if (event.getOwnerId().equals(userId)) return;
        boolean isParticipant = eventUserRepository.existsByEventIdAndUserId(event.getId(), userId);
        if (!isParticipant) {
            throw new AccessDeniedException("Access denied: you are not a participant");
        }
    }
}
