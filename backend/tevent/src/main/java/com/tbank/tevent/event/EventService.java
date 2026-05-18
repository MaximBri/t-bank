package com.tbank.tevent.event;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.category.CategoryService;
import com.tbank.tevent.category.dto.CategoryResponse;
import com.tbank.tevent.event.dto.CreatorInfo;
import com.tbank.tevent.event.dto.EventPreviewResponse;
import com.tbank.tevent.event.dto.EventRequest;
import com.tbank.tevent.invite_token.InviteTokenGenerator;
import com.tbank.tevent.repo.EventParticipantCount;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.EventUserRepository;
import com.tbank.tevent.repo.InvitationRepository;
import com.tbank.tevent.repo.InviteTokenRepository;
import com.tbank.tevent.repo.UserRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.EventInvitation;
import com.tbank.tevent.repo.entity.EventUser;
import com.tbank.tevent.repo.entity.InviteToken;
import com.tbank.tevent.repo.entity.User;
import jakarta.persistence.EntityNotFoundException;
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
    private final UserRepository userRepository;
    private final InvitationRepository invitationRepository;
    private final EventMapper eventMapper;

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
        Long count = eventUserRepository.countByEventId(eventId);
        List<CategoryResponse> list = categoryService.findAllByEventId(eventId);
        CreatorInfo creatorInfo = getCreatorInfo(event.getOwnerId());
        return eventMapper.mapToResponse(event, list, count, creatorInfo);
    }
    
    private CreatorInfo getCreatorInfo(UUID ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + ownerId));
        return CreatorInfo.from(
                owner.getFirstName(),
                owner.getSecondName(),
                owner.getLogin(),
                owner.getAvatarUrl()
        );
    }
    
    @Transactional(readOnly = true)
    public EventPreviewResponse getEventPreviewByToken(String token) {
        // Find token
        InviteToken inviteToken = inviteTokenRepository.findByToken(token)
                .orElseThrow(() -> new EntityNotFoundException("Invalid invite token"));
        
        // Check if token is expired
        if (inviteToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Invite token has expired");
        }
        
        // Find event by token
        Event event = eventRepository.findByInviteTokenId(inviteToken.getId())
                .orElseThrow(() -> new EntityNotFoundException("Event not found for this token"));
        
        // Get participant count
        Long participantCount = eventUserRepository.countByEventId(event.getId());
        
        // Get creator info
        CreatorInfo creatorInfo = getCreatorInfo(event.getOwnerId());
        
        // Return preview response
        return new EventPreviewResponse(
                event.getId(),
                event.getTitle(),
                event.getImageKey(), // Assuming imageKey is stored, might need conversion to URL
                participantCount,
                event.getStartDate(),
                event.getEndDate(),
                creatorInfo
        );
    }
    
    @Transactional
    public void applyToEvent(String token) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("Current user not found"));
        
        // Use existing InviteService logic
        // We need to inject InviteService or duplicate the logic
        // For now, let's duplicate the logic to avoid circular dependencies
        applyTokenLogic(currentUser, token);
    }
    
    private void applyTokenLogic(User user, String tokenValue) {
        InviteToken inviteToken = inviteTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new EntityNotFoundException("Invalid invite token"));

        if (inviteToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Invite token has expired");
        }

        Event event = eventRepository.findByInviteTokenId(inviteToken.getId())
                .orElseThrow(() -> new EntityNotFoundException("Event not found for this token"));

        checkIfEventIsCompleted(event);

        if (eventUserRepository.existsByEventIdAndUserId(event.getId(), user.getId())) {
            throw new IllegalStateException("User is already a participant of this event");
        }

        boolean alreadyInvited = invitationRepository.existsByEventIdAndUserId(event.getId(), user.getId());
        if (alreadyInvited) {
            throw new IllegalStateException("User has already applied to this event");
        }

        EventInvitation invitation = EventInvitation.builder()
                .eventId(event.getId())
                .userId(user.getId())
                .invitedBy(event.getOwnerId())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        invitationRepository.save(invitation);
    }

    @Transactional
    public EventResponse updateEvent(UUID eventId, EventRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (!event.getOwnerId().equals(currentUserId)) {
            throw new AccessDeniedException("Only owner can edit event");
        }

        checkIfEventIsCompleted(event);

        if (request.title() != null) event.setTitle(request.title());
        if (request.description() != null) event.setDescription(request.description());
        if (request.startDate() != null) event.setStartDate(request.startDate());
        if (request.endDate() != null) event.setEndDate(request.endDate());
        if (request.imageKey() != null) event.setImageKey(request.imageKey());

        eventRepository.saveAndFlush(event);

        // Sync categories if provided
        if (request.categories() != null) {
            categoryService.syncCategoriesWithEvent(eventId, request.categories());
        }

        return getEvent(eventId);
    }

    @Transactional
    public EventResponse completeEvent(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (!event.getOwnerId().equals(currentUserId)) {
            throw new AccessDeniedException("Only owner can complete event");
        }

        if (Boolean.TRUE.equals(event.getIsCompleted())) {
            throw new ValidationException("Event is already completed");
        }

        event.setIsCompleted(true);
        eventRepository.saveAndFlush(event);

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
        
        // Create map of ownerId to CreatorInfo for all unique owners
        Map<UUID, CreatorInfo> creatorInfoByOwnerId = events.stream()
                .map(Event::getOwnerId)
                .distinct()
                .collect(Collectors.toMap(
                        ownerId -> ownerId,
                        this::getCreatorInfo
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
                        countsByEventId.getOrDefault(e.getId(), 0L),
                        creatorInfoByOwnerId.get(e.getOwnerId())
                ))
                .toList();

        return new EventsResponse(responseList);
    }

    private void checkIfEventIsCompleted(Event event) {
        if (Boolean.TRUE.equals(event.getIsCompleted())) {
            throw new ValidationException("Cannot modify a completed event");
        }
    }

    private void checkAccess(Event event, UUID userId) {
        if (event.getOwnerId().equals(userId)) return;
        boolean isParticipant = eventUserRepository.existsByEventIdAndUserId(event.getId(), userId);
        if (!isParticipant) {
            throw new AccessDeniedException("Access denied: you are not a participant");
        }
    }
}
