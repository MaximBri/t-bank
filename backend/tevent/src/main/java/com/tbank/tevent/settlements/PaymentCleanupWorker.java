package com.tbank.tevent.settlements;

import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.repo.PaymentRepository;
import com.tbank.tevent.repo.entity.Expense;
import com.tbank.tevent.repo.entity.Payment;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PaymentCleanupWorker {
    private final PaymentRepository paymentRepository;

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void cleanup() {
        List<Payment> expired = paymentRepository.findAllByStatusAndExpiresAtBefore("INITIATED", LocalDateTime.now());
        for (Payment p : expired) {
            p.setStatus("FAILED");
        }
        paymentRepository.saveAll(expired);
    }
}
