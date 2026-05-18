package com.tbank.tevent.history;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/events/{eventId}/history")
@RequiredArgsConstructor
public class EventHistoryController {

    private final EventHistoryService eventHistoryService;

    @GetMapping
    public ResponseEntity<List<EventHistoryResponse>> getEventHistory(@PathVariable UUID eventId) {
        List<EventHistoryResponse> history = eventHistoryService.getEventHistory(eventId);
        return ResponseEntity.ok(history);
    }
}
