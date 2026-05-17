package com.tbank.tevent.settlements;

import com.tbank.tevent.EventBalanceRepository;
import com.tbank.tevent.repo.PaymentRepository;
import com.tbank.tevent.repo.UserRepository;
import com.tbank.tevent.repo.entity.Payment;
import com.tbank.tevent.repo.entity.User;
import com.tbank.tevent.settlements.dto.EventSettlementsResponse;
import com.tbank.tevent.settlements.dto.SettlementItemDTO;
import com.tbank.tevent.settlements.dto.SettlementStep;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SettlementQueryService {
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final EventBalanceRepository redisRepository;
    private final DebtCalculator debtCalculator;

    public EventSettlementsResponse getEventSettlements(UUID eventId, UUID currentUserId) {
        EventSettlementsResponse cached = redisRepository.getCachedSettlements(eventId);
        if (cached != null) {
            return updateCurrentUserFlags(cached, currentUserId);
        }

        List<Payment> livePayments = paymentRepository.findAllByEventIdAndStatusIn(
                eventId, List.of(PaymentStatus.ACTIVE, PaymentStatus.SENT)
        );


        if (livePayments.isEmpty()) {
            List<SettlementStep> steps = debtCalculator.calculateOptimalDebts(eventId);
            for (SettlementStep step : steps) {
                Payment newPayment = Payment.builder()
                        .eventId(eventId)
                        .fromUserId(step.fromUserId())
                        .toUserId(step.toUserId())
                        .amount(step.amount())
                        .status(PaymentStatus.ACTIVE)
                        .createdAt(LocalDateTime.now())
                        .build();
                paymentRepository.save(newPayment);
            }
        }

        List<Payment> allPayments = paymentRepository.findAllByEventId(eventId);

        Set<UUID> requiredUserIds = new HashSet<>();
        for (Payment p : allPayments) {
            requiredUserIds.add(p.getFromUserId());
            requiredUserIds.add(p.getToUserId());
        }

        List<User> users = userRepository.findAllByIdIn(requiredUserIds);
        Map<UUID, String> userNamesMap = new HashMap<>();
        for (User u : users) {
            String fullName = String.format("%s %s",
                    u.getFirstName() != null ? u.getFirstName() : "",
                    u.getSecondName() != null ? u.getSecondName() : "").trim();
            userNamesMap.put(u.getId(), fullName.isEmpty() ? u.getLogin() : fullName);
        }

        BigDecimal totalOutstanding = BigDecimal.ZERO;
        List<SettlementItemDTO> settlements = new ArrayList<>();

        for (Payment p : allPayments) {
            if (p.getStatus() == PaymentStatus.COMPLETED) continue;

            if (p.getStatus() != PaymentStatus.FAILED) {
                totalOutstanding = totalOutstanding.add(p.getAmount());
            }

            String debtorName = userNamesMap.getOrDefault(p.getFromUserId(), "Неизвестный пользователь");
            String creditorName = userNamesMap.getOrDefault(p.getToUserId(), "Неизвестный пользователь");

            settlements.add(new SettlementItemDTO(
                    p.getId(),
                    p.getFromUserId(), debtorName,
                    p.getToUserId(), creditorName,
                    p.getAmount(),
                    p.getStatus().name(),
                    false
            ));
        }

        EventSettlementsResponse finalResponse = new EventSettlementsResponse(eventId, totalOutstanding, settlements);

        redisRepository.cacheSettlements(eventId, finalResponse);

        return updateCurrentUserFlags(finalResponse, currentUserId);
    }

    private EventSettlementsResponse updateCurrentUserFlags(EventSettlementsResponse response, UUID currentUserId) {
        List<SettlementItemDTO> processedItems = response.settlements().stream()
                .map(item -> new SettlementItemDTO(
                        item.paymentId(), item.debtorId(), item.debtorName(),
                        item.creditorId(), item.creditorName(), item.amount(), item.status(),
                        item.debtorId().equals(currentUserId) || item.creditorId().equals(currentUserId)
                )).toList();
        return new EventSettlementsResponse(response.eventId(), response.totalOutstandingDebts(), processedItems);
    }
}
