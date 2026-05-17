package com.tbank.tevent.settlements;

import com.tbank.tevent.EventBalanceRepository;
import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.settlements.dto.SettlementStep;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

@Component
@RequiredArgsConstructor
public class DebtCalculator {
    private final ExpenseRepository expenseRepository;

    public List<SettlementStep> calculateOptimalDebts(UUID eventId) {
        List<Object[]> rawBalances = expenseRepository.findRawBalancesForEvent(eventId);

        List<UserBalance> debtors = new ArrayList<>();
        List<UserBalance> creditors = new ArrayList<>();

        for (Object[] row : rawBalances) {
            UUID userId = (UUID) row[0];
            BigDecimal balance = (BigDecimal) row[1];

            if (balance.compareTo(BigDecimal.ZERO) < 0) {
                debtors.add(new UserBalance(userId, balance.abs()));
            } else if (balance.compareTo(BigDecimal.ZERO) > 0) {
                creditors.add(new UserBalance(userId, balance));
            }
        }

        List<SettlementStep> steps = new ArrayList<>();
        int dIdx = 0, cIdx = 0;

        while (dIdx < debtors.size() && cIdx < creditors.size()) {
            UserBalance debtor = debtors.get(dIdx);
            UserBalance creditor = creditors.get(cIdx);

            BigDecimal amountToTransfer = debtor.amount.min(creditor.amount);

            if (amountToTransfer.compareTo(BigDecimal.ZERO) > 0) {
                steps.add(new SettlementStep(debtor.userId, creditor.userId, amountToTransfer));
            }

            debtor.amount = debtor.amount.subtract(amountToTransfer);
            creditor.amount = creditor.amount.subtract(amountToTransfer);

            if (debtor.amount.compareTo(BigDecimal.ZERO) == 0) dIdx++;
            if (creditor.amount.compareTo(BigDecimal.ZERO) == 0) cIdx++;
        }

        return steps;
    }

    private static class UserBalance {
        final UUID userId;
        BigDecimal amount;

        UserBalance(UUID userId, BigDecimal amount) {
            this.userId = userId;
            this.amount = amount;
        }
    }
}
