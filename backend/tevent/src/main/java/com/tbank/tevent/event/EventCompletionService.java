package com.tbank.tevent.event;


import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.PaymentRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.Payment;
import com.tbank.tevent.settlements.DebtCalculator;
import com.tbank.tevent.settlements.PaymentStatus;
import com.tbank.tevent.settlements.dto.SettlementStep;
import com.tbank.tevent.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@Slf4j
public class EventCompletionService {

    private final EventRepository eventRepository;
    private final DebtCalculator debtCalculator;
    private final PaymentRepository paymentRepository;

    @Transactional
    public EventResponse completeEvent(UUID eventId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return completeEventInternal(eventId, currentUserId, true);
    }

    @Transactional
    public EventResponse completeEventByScheduler(UUID eventId) {
        return completeEventInternal(eventId, null, false);
    }

    private EventResponse completeEventInternal(UUID eventId, UUID actorUserId, boolean enforceOwnerCheck) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        if (enforceOwnerCheck && (actorUserId == null || !event.getOwnerId().equals(actorUserId))) {
            throw new AccessDeniedException("Only owner can complete event");
        }

        if (Boolean.TRUE.equals(event.getIsCompleted())) {
            return null; // Уже завершено
        }

        event.setIsCompleted(true);
        event.setEndDate(LocalDateTime.now().isBefore(event.getStartDate()) ? event.getStartDate() : LocalDateTime.now());

        eventRepository.save(event);

        List<SettlementStep> settlements = debtCalculator.calculateOptimalDebts(eventId);

        for (SettlementStep step : settlements) {
            Payment payment = Payment.builder()
                    .eventId(eventId)
                    .fromUserId(step.fromUserId())
                    .toUserId(step.toUserId())
                    .amount(step.amount())
                    .status(PaymentStatus.ACTIVE)
                    .createdAt(LocalDateTime.now())
                    .expiresAt(LocalDateTime.now().plusDays(30))
                    .build();
            paymentRepository.save(payment);
        }

        log.info("Event {} completed successfully", eventId);
        return null;
    }
}
