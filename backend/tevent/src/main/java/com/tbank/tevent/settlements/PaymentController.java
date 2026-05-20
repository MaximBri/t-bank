package com.tbank.tevent.settlements;

import com.tbank.tevent.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentCommandService paymentCommandService;

    @PostMapping("{eventId}/payments/{paymentId}/sent")
    public ResponseEntity<Void> markAsSent(
            @PathVariable UUID eventId,
            @PathVariable UUID paymentId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        paymentCommandService.markAsSent(eventId, paymentId, currentUserId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("{eventId}/payments/{paymentId}/fail")
    public ResponseEntity<Void> markAsFailed(
            @PathVariable UUID eventId,
            @PathVariable UUID paymentId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        paymentCommandService.markAsFailed(eventId, paymentId, currentUserId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("{eventId}/payments/{paymentId}/complete")
    public ResponseEntity<Void> markAsComplete(
            @PathVariable UUID eventId,
            @PathVariable UUID paymentId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        paymentCommandService.markAsComplete(eventId, paymentId, currentUserId);
        return ResponseEntity.ok().build();
    }
}
