package com.tbank.tevent.event;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.category.CategoryService;
import com.tbank.tevent.category.dto.CategoryResponse;
import com.tbank.tevent.event.dto.EventRequest;
import com.tbank.tevent.invite_token.InviteTokenGenerator;
import com.tbank.tevent.repo.EventParticipantCount;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.EventUserRepository;
import com.tbank.tevent.repo.InviteTokenRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.EventUser;
import com.tbank.tevent.repo.entity.InviteToken;
import com.tbank.tevent.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventUserRepository eventUserRepository;
    private final CategoryService categoryService;
    private final InviteTokenRepository inviteTokenRepository;
    private final EventMapper eventMapper;
    private final S3Service s3Service;

    @Transactional
    public EventResponse createEvent(EventRequest request) {
        Validator.validateDates(request.startDate(), request.endDate());
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        LocalDateTime now = LocalDateTime.now();

        InviteToken inviteToken = InviteToken.builder()
                .token(InviteTokenGenerator.generate())
                .expiresAt(now.plusDays(2))
                .createdAt(now)
                .build();
        inviteToken = inviteTokenRepository.save(inviteToken);
        s3Service.useKey(currentUserId, request.imageKey());

        Event event = new Event();
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setStartDate(request.startDate());
        event.setEndDate(request.endDate());
        event.setOwnerId(currentUserId);
        event.setImageKey(request.imageKey());
        event.setInviteTokenId(inviteToken.getId());

        event = eventRepository.saveAndFlush(event);

        EventUser eventUser = new EventUser();
        eventUser.setEventId(event.getId());
        eventUser.setUserId(currentUserId);
        eventUser.setRole("OWNER");
        eventUser.setJoinedAt(LocalDateTime.now());
        eventUserRepository.saveAndFlush(eventUser);

        categoryService.syncCategoriesWithEvent(event.getId(), request.categories());

        return getEvent(event.getId());
    }

    @Transactional(readOnly = true)
    public EventResponse getEvent(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));
        checkAccess(event, SecurityUtils.getCurrentUserId());
        Long count=eventUserRepository.countByEventId(eventId);
        List<CategoryResponse> list=categoryService.findAllByEventId(eventId);
        return eventMapper.mapToResponse(event, list, count);
    }

    @Transactional
    public EventResponse updateEvent(UUID eventId, EventRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (!event.getOwnerId().equals(currentUserId)) {
            throw new AccessDeniedException("Only owner can edit event");
        }

        if (request.title() != null) event.setTitle(request.title());
        if (request.description() != null) event.setDescription(request.description());
        if (request.startDate() != null) event.setStartDate(request.startDate());
        if (request.endDate() != null) event.setEndDate(request.endDate());
        if (request.imageKey() != null) {
            s3Service.useKey(currentUserId, request.imageKey());
            event.setImageKey(request.imageKey());
        }

        eventRepository.saveAndFlush(event);

        if (request.categories() != null) {
            categoryService.syncCategoriesWithEvent(eventId, request.categories());
        }

        return getEvent(eventId);
    }

    @Transactional(readOnly = true)
    public EventsResponse getUserEvents(String state,
                                        LocalDate startDate,
                                        LocalDate endDate,
                                        Integer minParticipants,
                                        Integer maxParticipants) {
        if (state != null && !Set.of("PLANNED", "ACTIVE", "COMPLETED").contains(state)) {
            throw new ValidationException("Invalid state value. Allowed values: PLANNED, ACTIVE, COMPLETED");
        }

        UUID currentUserId = SecurityUtils.getCurrentUserId();

        List<Event> events = eventRepository.findUserEventsWithFilters(
                currentUserId,
                state,
                startDate != null ? startDate.atStartOfDay() : null,
                endDate != null ? endDate.atTime(23, 59, 59) : null,
                minParticipants,
                maxParticipants
        );

        if (events.isEmpty()) {
            return new EventsResponse(List.of());
        }

        List<UUID> eventIds = events.stream().map(Event::getId).toList();


        Map<UUID, List<String>> categoriesByEventId = categoryService.findAllByEventIds(eventIds)
                .stream()
                .collect(Collectors.groupingBy(
                        CategoryResponse::eventId,
                        Collectors.mapping(CategoryResponse::name, Collectors.toList())
                ));


        Map<UUID, Long> countsByEventId = eventUserRepository.countParticipantsByEventIds(eventIds)
                .stream()
                .collect(Collectors.toMap(
                        EventParticipantCount::eventId,
                        EventParticipantCount::count
                ));

        List<EventResponse> responseList = events.stream()
                .map(e -> new EventResponse(
                        e.getId(),
                        e.getTitle(),
                        e.getDescription(),
                        e.getStartDate(),
                        e.getEndDate(),
                        categoriesByEventId.getOrDefault(e.getId(), List.of()),
                        EventStatusCalculator.calculate(e.getStartDate(), e.getEndDate()),
                        e.getImageKey(),
                        e.getOwnerId(),
                        countsByEventId.getOrDefault(e.getId(), 0L)
                ))
                .toList();

        return new EventsResponse(responseList);
    }

    private void checkAccess(Event event, UUID userId) {
        if (event.getOwnerId().equals(userId)) return;
        boolean isParticipant = eventUserRepository.existsByEventIdAndUserId(event.getId(), userId);
        if (!isParticipant) {
            throw new AccessDeniedException("Access denied: you are not a participant");
        }
    }
}
