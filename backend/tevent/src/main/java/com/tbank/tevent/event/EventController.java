package com.tbank.tevent.event;

import com.tbank.tevent.event.dto.*;
import com.tbank.tevent.invite_token.EventTokenResponse;
import com.tbank.tevent.invite_token.InviteTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final EventMemberService eventMemberService;
    private final InviteTokenService inviteTokenService;

    @PostMapping
    public ResponseEntity<EventResponse> createEvent(@Valid @RequestBody EventRequest request) {
        EventResponse response = eventService.createEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<EventResponse> getEvent(@PathVariable UUID eventId) {
        EventResponse response = eventService.getEvent(eventId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/preview/{token}")
    public ResponseEntity<EventPreviewResponse> getEventPreview(@PathVariable String token) {
        EventPreviewResponse response = eventService.getEventPreviewByToken(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{token}/apply")
    public ResponseEntity<Void> applyToEvent(@PathVariable String token) {
        eventService.applyToEvent(token);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{eventId}")
    public ResponseEntity<EventResponse> updateEvent(@PathVariable UUID eventId,
                                                     @RequestBody EventRequest request) {
        EventResponse response = eventService.updateEvent(eventId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/events")
    public ResponseEntity<EventsResponse> getUserEvents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer minParticipants,
            @RequestParam(required = false) Integer maxParticipants) {

        EventsResponse events = eventService.getUserEvents(
                search, state, startDate, endDate, minParticipants, maxParticipants);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{eventId}/participants")
    public ResponseEntity<ParticipantsResponse> getParticipants(@PathVariable UUID eventId) {
        return ResponseEntity.ok(new ParticipantsResponse(eventMemberService.getParticipants(eventId)));
    }
    
    @DeleteMapping("/{eventId}/participants/{userId}")
    public ResponseEntity<Void> removeParticipant(@PathVariable UUID eventId, @PathVariable UUID userId) {
        eventMemberService.removeParticipant(eventId, userId);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/{eventId}/exit")
    public ResponseEntity<Void> leaveEvent(@PathVariable UUID eventId) {
        eventMemberService.leaveEvent(eventId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{eventId}/complete")
    public ResponseEntity<EventResponse> completeEvent(@PathVariable UUID eventId) {
        EventResponse response = eventService.completeEvent(eventId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{eventId}/token")
    public ResponseEntity<EventTokenResponse> getEventToken(@PathVariable UUID eventId) {
        return ResponseEntity.ok(inviteTokenService.getTokenForEvent(eventId));
    }
}
