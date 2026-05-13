package com.tbank.tevent.settlements;

import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.repo.ExpenseSplitRepository;
import com.tbank.tevent.repo.PaymentRepository;
import com.tbank.tevent.repo.entity.Expense;
import com.tbank.tevent.repo.entity.ExpenseSplit;
import com.tbank.tevent.settlements.dto.SettlementStep;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DebtSimplificationService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository splitRepository;
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public List<SettlementStep> calculateSettlements(UUID eventId) {
        // 1. Считаем чистые балансы по подтвержденным чекам
        Map<UUID, BigDecimal> balances = new HashMap<>();

        // Кто платил (+)
        expenseRepository.findAllByEventIdAndStatus(eventId, "CONFIRMED")
                .forEach(e -> balances.merge(e.getPayerId(), e.getAmount(), BigDecimal::add));

        // Кто участвовал (-)
        splitRepository.findAllConfirmedByEventId(eventId)
                .forEach(s -> balances.merge(s.getUserId(), s.getAmount().negate(), BigDecimal::add));

        // 2. КОРРЕКТИРУЕМ на уже завершенные платежи (Payments)
        // Если я уже отправил 1000р, мой долг уменьшается (баланс стремится в +)
        paymentRepository.findAllByEventIdAndStatus(eventId, "COMPLETED")
                .forEach(p -> {
                    balances.merge(p.getFromUserId(), p.getAmount(), BigDecimal::add);
                    balances.merge(p.getToUserId(), p.getAmount().negate(), BigDecimal::add);
                });

        // 3. Алгоритм упрощения (Min-Cash-Flow) на остаточных балансах
        return runMinCashFlow(balances);
    }

    private List<SettlementStep> runMinCashFlow(Map<UUID, BigDecimal> balances) {
        PriorityQueue<UserBalance> debtors = new PriorityQueue<>(Comparator.comparing(UserBalance::amount));
        PriorityQueue<UserBalance> creditors = new PriorityQueue<>(Comparator.comparing(UserBalance::amount).reversed());

        balances.forEach((userId, balance) -> {
            if (balance.compareTo(BigDecimal.ZERO) < 0) {
                debtors.add(new UserBalance(userId, balance.abs()));
            } else if (balance.compareTo(BigDecimal.ZERO) > 0) {
                creditors.add(new UserBalance(userId, balance));
            }
        });

        List<SettlementStep> steps = new ArrayList<>();
        while (!debtors.isEmpty() && !creditors.isEmpty()) {
            UserBalance debtor = debtors.poll();
            UserBalance creditor = creditors.poll();

            BigDecimal amount = debtor.amount().min(creditor.amount());
            steps.add(new SettlementStep(debtor.userId(), creditor.userId(), amount));

            if (debtor.amount().compareTo(amount) > 0) {
                debtors.add(new UserBalance(debtor.userId(), debtor.amount().subtract(amount)));
            }
            if (creditor.amount().compareTo(amount) > 0) {
                creditors.add(new UserBalance(creditor.userId(), creditor.amount().subtract(amount)));
            }
        }
        return steps;
    }

    private record UserBalance(UUID userId, BigDecimal amount) {}
}
