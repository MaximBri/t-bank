package com.tbank.tevent.participant;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class ParticipantController {

    private final ParticipantService participantService;

    @GetMapping("/{eventId}/participants")
    public ResponseEntity<ParticipantsResponse> getParticipants(
            @PathVariable UUID eventId,
            @RequestParam(required = false) String status) {

        ParticipantsResponse response = participantService.getParticipants(eventId);
        return ResponseEntity.ok(response);
    }
}
