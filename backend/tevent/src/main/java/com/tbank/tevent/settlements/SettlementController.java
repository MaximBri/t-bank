package com.tbank.tevent.settlements;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.settlements.dto.EventSettlementsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/events/{eventId}/settlements")
@RequiredArgsConstructor
public class SettlementController {
    private final SettlementQueryService settlementQueryService;

    @GetMapping
    public ResponseEntity<EventSettlementsResponse> getSettlements(@PathVariable UUID eventId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(settlementQueryService.getEventSettlements(eventId,  currentUserId));
    }
}
