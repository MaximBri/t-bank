package com.tbank.tevent.settlements;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.notifications.NotificationService;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.repo.PaymentRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.Expense;
import com.tbank.tevent.repo.entity.Payment;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;

    @Transactional
    public UUID initiatePayment(UUID eventId, UUID fromUserId, UUID toUserId, BigDecimal amount) {

        boolean hasPending = paymentRepository.existsByFromUserIdAndToUserIdAndStatusIn(
                fromUserId, toUserId, List.of("INITIATED", "SENT"));

        if (hasPending) throw new IllegalStateException("У вас есть активный платеж этому пользователю.");

        Payment payment = Payment.builder()
                .eventId(eventId)
                .fromUserId(fromUserId)
                .toUserId(toUserId)
                .amount(amount)
                .status("INITIATED")
                .expiresAt(LocalDateTime.now().plusMinutes(20))
                .build();

        return paymentRepository.save(payment).getId();
    }

    @Transactional
    public void completePayment(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId).orElseThrow();
        payment.setStatus("COMPLETED");
        payment.setConfirmedAt(LocalDateTime.now());
        // ВСЁ. Мы не трогаем Expenses. При следующем расчете баланса
        // этот платеж просто вычтется из долга.
    }

    @Transactional
    public void markAsSent(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new EntityNotFoundException("Платеж не найден"));

        // Перевести в SENT можно только из INITIATED
        if (!"INITIATED".equals(payment.getStatus())) {
            throw new IllegalStateException("Нельзя пометить как отправленный платеж в статусе " + payment.getStatus());
        }

        payment.setStatus("SENT");
        // Мы можем также обновить expiresAt или записать время отправки
        paymentRepository.save(payment);

        // Нотификация кредитору: "Вася говорит, что перевел тебе 500р. Подтверди получение."
        notificationService.createNotifications(
                List.of(payment.getToUserId()),
                payment.getEventId(),
                null, // expenseId тут не нужен
                "Входящий платеж",
                "Вам отправили перевод. Подтвердите получение, когда деньги придут на карту."
        );
    }

    @Transactional
    public void cancelPayment(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new EntityNotFoundException("Платеж не найден"));

        // Отменить можно только то, что еще не завершено (INITIATED или SENT)
        if (List.of("COMPLETED", "FAILED").contains(payment.getStatus())) {
            throw new IllegalStateException("Нельзя отменить платеж в статусе " + payment.getStatus());
        }

        String oldStatus = payment.getStatus();
        payment.setStatus("FAILED");
        paymentRepository.save(payment);

        // Уведомляем вторую сторону об отмене
        // Если отменил должник (INITIATED) -> уведомляем кредитора (если он успел увидеть)
        // Если "зафейлил" кредитор (сказал, что деньги не пришли) -> уведомляем должника
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        UUID recipientId = currentUserId.equals(payment.getFromUserId())
                ? payment.getToUserId()
                : payment.getFromUserId();

        notificationService.createNotifications(
                List.of(recipientId),
                payment.getEventId(),
                null,
                "Платеж отменен",
                "Запись о переводе средств была аннулирована или отклонена."
        );
    }
}