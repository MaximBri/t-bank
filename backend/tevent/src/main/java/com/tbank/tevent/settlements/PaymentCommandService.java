package com.tbank.tevent.settlements;

import com.tbank.tevent.EventBalanceRepository;
import com.tbank.tevent.event.EventAccessGuard;
import com.tbank.tevent.history.ActionType;
import com.tbank.tevent.history.EventHistoryService;
import com.tbank.tevent.repo.PaymentRepository;
import com.tbank.tevent.repo.entity.Payment;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentCommandService {

    private final PaymentRepository paymentRepository;
    private final EventHistoryService historyService;
    private final EventBalanceRepository redisRepository;
    private final EventAccessGuard eventAccessGuard;

    public void markAsSent(UUID eventId, UUID paymentId, UUID currentUserId) {
        Payment payment = getPaymentForEvent(eventId, paymentId, currentUserId);

        if (payment.getStatus() != PaymentStatus.ACTIVE) {
            throw new IllegalStateException("Отправить можно только ACTIVE платеж");
        }
        if (!payment.getFromUserId().equals(currentUserId)) {
            throw new AccessDeniedException("Вы не являетесь должником по этому платежу!");
        }

        payment.setStatus(PaymentStatus.SENT);

        redisRepository.clearCalculatedDebts(payment.getEventId());

        historyService.log(
                payment.getEventId(),
                currentUserId,
                ActionType.PAYMENT_SENT,
                String.format("Инициировал перевод на сумму %s ₽", payment.getAmount())
        );
    }

    public void markAsFailed(UUID eventId, UUID paymentId, UUID currentUserId) {
        Payment payment = getPaymentForEvent(eventId, paymentId, currentUserId);

        if (payment.getStatus() != PaymentStatus.SENT) {
            throw new IllegalStateException("Отклонить можно только отправленный (SENT) платеж");
        }
        if (!payment.getToUserId().equals(currentUserId)) {
            throw new AccessDeniedException("Вы не являетесь получателем этого платежа!");
        }

        payment.setStatus(PaymentStatus.FAILED);

        paymentRepository.deleteAllByEventIdAndStatus(payment.getEventId(), PaymentStatus.ACTIVE);

        redisRepository.clearCalculatedDebts(payment.getEventId());

        historyService.log(
                payment.getEventId(),
                currentUserId,
                ActionType.PAYMENT_FAILED,
                String.format("Отклонил платеж на сумму %s ₽. Деньги не поступили на счет.", payment.getAmount())
        );
    }

    public void markAsComplete(UUID eventId, UUID paymentId, UUID currentUserId) {
        Payment payment = getPaymentForEvent(eventId, paymentId, currentUserId);

        if (payment.getStatus() != PaymentStatus.SENT) {
            throw new IllegalStateException("Подтвердить можно только отправленный (SENT) платеж");
        }
        if (!payment.getToUserId().equals(currentUserId)) {
            throw new AccessDeniedException("Вы не получатель, подтверждение заблокировано!");
        }

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setConfirmedAt(LocalDateTime.now());


        paymentRepository.deleteAllByEventIdAndStatus(payment.getEventId(), PaymentStatus.ACTIVE);

        
        redisRepository.clearCalculatedDebts(payment.getEventId());

        historyService.log(
                payment.getEventId(),
                currentUserId,
                ActionType.PAYMENT_COMPLETED,
                String.format("Подтвердил получение платежа на сумму %s ₽. Баланс группы пересчитан.", payment.getAmount())
        );
    }

    /**
     * Загружает платёж и проверяет: (1) вызывающий — участник события,
     * (2) платёж реально принадлежит этому событию (защита от IDOR:
     * нельзя дёргать чужой paymentId через произвольный eventId в path).
     */
    private Payment getPaymentForEvent(UUID eventId, UUID paymentId, UUID currentUserId) {
        eventAccessGuard.requireMember(eventId, currentUserId);
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Платеж не найден"));
        if (!payment.getEventId().equals(eventId)) {
            throw new AccessDeniedException("Платёж не относится к этому событию");
        }
        return payment;
    }
}
