package com.tbank.tevent.event;

import com.tbank.tevent.category.CategoryService;
import com.tbank.tevent.category.dto.CategoryResponse;
import com.tbank.tevent.event.dto.EventRequest;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.EventUserRepository;
import com.tbank.tevent.repo.InviteTokenRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.InviteToken;
import com.tbank.tevent.repo.entity.User;
import com.tbank.tevent.s3.S3Service;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;
    @Mock
    private EventUserRepository eventUserRepository;
    @Mock
    private CategoryService categoryService;
    @Mock
    private InviteTokenRepository inviteTokenRepository;
    @Mock
    private EventMapper eventMapper;
    @Mock
    private S3Service s3Service;

    private EventService eventService;
    private UUID currentUserId;

    @BeforeEach
    void setUp() {
        eventService = new EventService(eventRepository, eventUserRepository, categoryService, inviteTokenRepository, eventMapper, s3Service);
        currentUserId = UUID.randomUUID();
        User user = User.builder().id(currentUserId).login("user").build();
        SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken(user, null));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createEventShouldUseImageKeyAndPersistIt() {
        UUID eventId = UUID.randomUUID();
        UUID tokenId = UUID.randomUUID();
        String imageKey = "receipts/" + currentUserId + "/event.jpg";

        EventRequest request = new EventRequest(
                "Title",
                "Desc",
                LocalDateTime.now().plusDays(1),
                LocalDateTime.now().plusDays(2),
                imageKey,
                List.of("Food")
        );

        InviteToken savedToken = InviteToken.builder().id(tokenId).token("invite").build();
        when(inviteTokenRepository.save(any(InviteToken.class))).thenReturn(savedToken);

        Event persistedEvent = new Event();
        persistedEvent.setId(eventId);
        persistedEvent.setOwnerId(currentUserId);
        persistedEvent.setInviteTokenId(tokenId);
        persistedEvent.setTitle(request.title());
        persistedEvent.setDescription(request.description());
        persistedEvent.setStartDate(request.startDate());
        persistedEvent.setEndDate(request.endDate());
        persistedEvent.setImageKey(imageKey);

        when(eventRepository.saveAndFlush(any(Event.class))).thenReturn(persistedEvent);
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(persistedEvent));
        when(eventUserRepository.countByEventId(eventId)).thenReturn(1L);
        when(categoryService.findAllByEventId(eventId)).thenReturn(List.of());
        EventResponse expected = new EventResponse(
                eventId,
                request.title(),
                request.description(),
                request.startDate(),
                request.endDate(),
                List.of(),
                "PLANNED",
                imageKey,
                currentUserId,
                1L
        );
        when(eventMapper.mapToResponse(eq(persistedEvent), any(List.class), eq(1L))).thenReturn(expected);

        EventResponse result = eventService.createEvent(request);

        assertThat(result.imageKey()).isEqualTo(imageKey);
        verify(s3Service).useKey(currentUserId, imageKey);
        ArgumentCaptor<Event> eventCaptor = ArgumentCaptor.forClass(Event.class);
        verify(eventRepository).saveAndFlush(eventCaptor.capture());
        assertThat(eventCaptor.getValue().getImageKey()).isEqualTo(imageKey);
    }

    @Test
    void updateEventShouldUseImageKeyWhenProvided() {
        UUID eventId = UUID.randomUUID();
        String newImageKey = "receipts/" + currentUserId + "/updated.jpg";

        Event existing = new Event();
        existing.setId(eventId);
        existing.setOwnerId(currentUserId);
        existing.setTitle("Old");
        existing.setDescription("Old");
        existing.setStartDate(LocalDateTime.now().plusDays(1));
        existing.setEndDate(LocalDateTime.now().plusDays(2));

        EventRequest request = new EventRequest(
                null,
                null,
                null,
                null,
                newImageKey,
                null
        );

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(existing));
        when(eventUserRepository.countByEventId(eventId)).thenReturn(1L);
        when(categoryService.findAllByEventId(eventId)).thenReturn(List.<CategoryResponse>of());
        EventResponse expected = new EventResponse(
                eventId,
                existing.getTitle(),
                existing.getDescription(),
                existing.getStartDate(),
                existing.getEndDate(),
                List.of(),
                "PLANNED",
                newImageKey,
                currentUserId,
                1L
        );
        when(eventMapper.mapToResponse(eq(existing), any(List.class), eq(1L))).thenReturn(expected);

        EventResponse result = eventService.updateEvent(eventId, request);

        assertThat(result.imageKey()).isEqualTo(newImageKey);
        verify(s3Service).useKey(currentUserId, newImageKey);
        verify(eventRepository).saveAndFlush(existing);
        assertThat(existing.getImageKey()).isEqualTo(newImageKey);
    }
}
