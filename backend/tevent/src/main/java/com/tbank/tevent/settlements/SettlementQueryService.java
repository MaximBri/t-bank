package com.tbank.tevent.settlements;

import com.tbank.tevent.event.EventAccessGuard;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.repo.PaymentRepository;
import com.tbank.tevent.repo.UserRepository;
import com.tbank.tevent.repo.entity.Payment;
import com.tbank.tevent.repo.entity.User;
import com.tbank.tevent.settlements.dto.EventSettlementsResponse;
import com.tbank.tevent.settlements.dto.SettlementItemDTO;
import com.tbank.tevent.settlements.dto.SettlementStep;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SettlementQueryService {
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final EventAccessGuard eventAccessGuard;
    private final EventRepository eventRepository;
    @Transactional
    public EventSettlementsResponse getEventSettlements(UUID eventId, UUID currentUserId) {
        eventAccessGuard.requireMember(eventId, currentUserId);

        if(!eventRepository.findById(eventId).get().getState().equals("COMPLETED")) {
            throw new IllegalArgumentException("Event is not completed");
        }

        // Fetch all payments for the event
        List<Payment> payments = paymentRepository.findAllByEventId(eventId);
        
        Map<UUID, String> userNameCache = new HashMap<>();
        
        // Calculate total outstanding debts (sum of amounts for ACTIVE and SENT payments)
        BigDecimal totalOutstanding = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.ACTIVE || p.getStatus() == PaymentStatus.SENT)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Convert Payment to SettlementItemDTO
        List<SettlementItemDTO> settlements = payments.stream()
                .map(payment -> {
                    String debtorName = getUserName(payment.getFromUserId(), userNameCache);
                    String creditorName = getUserName(payment.getToUserId(), userNameCache);
                    
                    // Check if current user is involved in this payment
                    boolean isCurrentUserRelated = currentUserId.equals(payment.getFromUserId()) ||
                                                  currentUserId.equals(payment.getToUserId());
                    
                    return new SettlementItemDTO(
                            payment.getId(),
                            payment.getFromUserId(),
                            debtorName,
                            payment.getToUserId(),
                            creditorName,
                            payment.getAmount(),
                            payment.getStatus().name(),
                            isCurrentUserRelated
                    );
                })
                .collect(Collectors.toList());
        
        log.debug("Returning {} payments for event {} with total outstanding {}",
                settlements.size(), eventId, totalOutstanding);
        
        return new EventSettlementsResponse(eventId, totalOutstanding, settlements);
    }
    
    private String getUserName(UUID userId, Map<UUID, String> cache) {
        return cache.computeIfAbsent(userId, id -> {
            User user = userRepository.findById(id).orElse(null);
            return user != null ? user.getFirstName() : "Unknown User";
        });
    }
}
