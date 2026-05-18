package com.tbank.tevent.repo;

import com.tbank.tevent.repo.entity.Payment;
import com.tbank.tevent.settlements.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    boolean existsByFromUserIdAndEventIdAndStatusIn(UUID fromUserId, UUID eventId, List<String> statuses);
    List<Payment> findAllByStatusAndExpiresAtBefore(String status, LocalDateTime expiresAt);
    List<Payment> findAllByEventIdAndStatus(UUID eventId, String status);
    boolean existsByFromUserIdAndToUserIdAndStatusIn(
           UUID fromUserId, UUID toUserId, List<String> statuses);
    List<Payment> findAllByEventIdAndStatusIn(UUID eventId, List<PaymentStatus> statuses);
    List<Payment> findAllByStatusInAndExpiresAtBefore(List<PaymentStatus> statuses, LocalDateTime expiresAt);
    List<Payment> findAllByEventId(UUID eventId);
    void deleteAllByEventIdAndStatus(UUID eventId, PaymentStatus status);
}
