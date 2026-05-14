package com.tbank.tevent.settlements;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.settlements.dto.InitiatePaymentRequest;
import com.tbank.tevent.settlements.dto.SettlementStep;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/events/{eventId}")
@RequiredArgsConstructor
public class SettlementController {

    private final DebtSimplificationService debtService;
    private final PaymentService paymentService;


    @GetMapping("/settlements")
    public ResponseEntity<List<SettlementStep>> getSettlements(@PathVariable UUID eventId) {
        return ResponseEntity.ok(debtService.calculateSettlements(eventId));
    }


    @PostMapping("/payments/initiate")
    public ResponseEntity<UUID> initiate(@PathVariable UUID eventId, @RequestBody InitiatePaymentRequest request) {
        UUID paymentId = paymentService.initiatePayment(
                eventId,
                SecurityUtils.getCurrentUserId(),
                request.toUserId(),
                request.amount()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentId);
    }


    @PostMapping("/payments/{paymentId}/sent")
    public ResponseEntity<Void> markAsSent(@PathVariable UUID eventId, @PathVariable UUID paymentId) {
        paymentService.markAsSent(paymentId);
        return ResponseEntity.ok().build();
    }


    @PostMapping("/payments/{paymentId}/fail")
    public ResponseEntity<Void> markAsFailed(@PathVariable UUID eventId, @PathVariable UUID paymentId) {
        paymentService.cancelPayment(paymentId);
        return ResponseEntity.ok().build();
    }


    @PostMapping("/payments/{paymentId}/complete")
    public ResponseEntity<Void> complete(@PathVariable UUID eventId, @PathVariable UUID paymentId) {
        paymentService.completePayment(paymentId);
        return ResponseEntity.ok().build();
    }
}
