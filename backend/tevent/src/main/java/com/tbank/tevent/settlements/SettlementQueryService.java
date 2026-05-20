package com.tbank.tevent.settlements;

import com.tbank.tevent.EventBalanceRepository;
import com.tbank.tevent.event.EventAccessGuard;
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
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SettlementQueryService {
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final EventBalanceRepository redisRepository;
    private final DebtCalculator debtCalculator;
    private final ExpenseRepository expenseRepository;
    private final EventAccessGuard eventAccessGuard;

    // @Transactional: метод лениво создаёт ACTIVE-платежи (debtCalculator →
    // paymentRepository.save). Без транзакции два параллельных GET создавали
    // дубли. Транзакция + проверка livePayments внутри неё устраняет гонку.
    @Transactional
    public EventSettlementsResponse getEventSettlements(UUID eventId, UUID currentUserId) {
        eventAccessGuard.requireMember(eventId, currentUserId);
        log.debug("Getting settlements for event: {}, current user: {}", eventId, currentUserId);

        EventSettlementsResponse cached = redisRepository.getCachedSettlements(eventId);
        if (cached != null) {
            log.debug("Returning cached settlements for event: {}", eventId);
            return updateCurrentUserFlags(cached, currentUserId);
        }

        // Проверяем наличие подтвержденных расходов
        List<com.tbank.tevent.repo.entity.Expense> confirmedExpenses =
            expenseRepository.findAllByEventIdAndStatus(eventId, "CONFIRMED");
        log.debug("Found {} confirmed expenses for event: {}", confirmedExpenses.size(), eventId);
        
        if (confirmedExpenses.isEmpty()) {
            log.info("No confirmed expenses found for event: {}. Returning empty settlements.", eventId);
            EventSettlementsResponse emptyResponse = new EventSettlementsResponse(
                eventId, BigDecimal.ZERO, List.of());
            // Не кэшируем пустой результат
            return updateCurrentUserFlags(emptyResponse, currentUserId);
        }

        List<Payment> livePayments = paymentRepository.findAllByEventIdAndStatusIn(
                eventId, List.of(PaymentStatus.ACTIVE, PaymentStatus.SENT)
        );
        log.debug("Found {} live payments (ACTIVE/SENT) for event: {}", livePayments.size(), eventId);

        if (livePayments.isEmpty()) {
            log.debug("No live payments found, calculating optimal debts for event: {}", eventId);
            List<SettlementStep> steps = debtCalculator.calculateOptimalDebts(eventId);
            log.debug("Debt calculator returned {} settlement steps", steps.size());
            
            for (SettlementStep step : steps) {
                Payment newPayment = Payment.builder()
                        .eventId(eventId)
                        .fromUserId(step.fromUserId())
                        .toUserId(step.toUserId())
                        .amount(step.amount())
                        .status(PaymentStatus.ACTIVE)
                        .createdAt(LocalDateTime.now())
                        .expiresAt(LocalDateTime.now().plusDays(30)) // Устанавливаем срок действия 30 дней
                        .build();
                paymentRepository.save(newPayment);
                log.debug("Created new payment: {} -> {} : {} (expires at: {})",
                        step.fromUserId(), step.toUserId(), step.amount(), newPayment.getExpiresAt());
            }
        }

        List<Payment> allPayments = paymentRepository.findAllByEventId(eventId);
        log.debug("Total payments for event {}: {}", eventId, allPayments.size());

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
            if (p.getStatus() == PaymentStatus.COMPLETED) {
                log.debug("Skipping completed payment: {}", p.getId());
                continue;
            }

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
            log.debug("Added settlement item: {} -> {} : {} ({})",
                    p.getFromUserId(), p.getToUserId(), p.getAmount(), p.getStatus());
        }

        EventSettlementsResponse finalResponse = new EventSettlementsResponse(eventId, totalOutstanding, settlements);
        log.debug("Final response: {} settlements, total outstanding: {}",
                settlements.size(), totalOutstanding);

        // Не кэшируем пустые результаты, чтобы избежать проблем с кэшированием
        if (!settlements.isEmpty()) {
            redisRepository.cacheSettlements(eventId, finalResponse);
            log.debug("Cached settlements for event: {} ({} items)", eventId, settlements.size());
        } else {
            log.info("Not caching empty settlements for event: {}", eventId);
        }

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
