package com.tbank.tevent.settlements;

import com.tbank.tevent.EventBalanceRepository;
import com.tbank.tevent.repo.PaymentRepository;
import com.tbank.tevent.repo.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Помечает просроченные неоплаченные платежи (ACTIVE/SENT с истёкшим
 * expiresAt) как FAILED. Без этого просроченный ACTIVE-платёж навсегда
 * остаётся в livePayments и блокирует пересчёт долгов события
 * (SettlementQueryService считает livePayments непустым и не пересчитывает).
 *
 * Восстановлен после рефакторинга в PR #150: старый воркер был удалён,
 * а findAllByStatusAndExpiresAtBefore осиротел — cleanup не выполнялся.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentCleanupWorker {

    private final PaymentRepository paymentRepository;
    private final EventBalanceRepository redisRepository;

    @Scheduled(fixedDelayString = "${app.payments.cleanup-fixed-delay-ms:60000}")
    @Transactional
    public void cleanup() {
        List<Payment> expired = paymentRepository.findAllByStatusInAndExpiresAtBefore(
                List.of(PaymentStatus.ACTIVE, PaymentStatus.SENT), LocalDateTime.now());
        if (expired.isEmpty()) {
            return;
        }

        Set<UUID> affectedEvents = new HashSet<>();
        for (Payment p : expired) {
            p.setStatus(PaymentStatus.FAILED);
            affectedEvents.add(p.getEventId());
        }
        paymentRepository.saveAll(expired);

        // Сбросить кэш долгов затронутых событий, чтобы следующий
        // getEventSettlements пересчитал их заново.
        for (UUID eventId : affectedEvents) {
            redisRepository.clearCalculatedDebts(eventId);
        }

        log.info("Payment cleanup: marked {} expired payments as FAILED across {} events",
                expired.size(), affectedEvents.size());
    }
}
