package com.tbank.tevent.settlements;

import com.tbank.tevent.EventBalanceRepository;
import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.settlements.dto.SettlementStep;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DebtCalculator {
    private final ExpenseRepository expenseRepository;

    public List<SettlementStep> calculateOptimalDebts(UUID eventId) {
        log.debug("Calculating optimal debts for event: {}", eventId);
        
        List<Object[]> rawBalances = expenseRepository.findRawBalancesForEvent(eventId);
        log.debug("Raw balances query returned {} rows", rawBalances.size());
        
        if (rawBalances.isEmpty()) {
            log.info("No raw balances found for event: {} - either no confirmed expenses or all balances are zero", eventId);
        }

        List<UserBalance> debtors = new ArrayList<>();
        List<UserBalance> creditors = new ArrayList<>();

        for (Object[] row : rawBalances) {
            UUID userId = (UUID) row[0];
            BigDecimal balance = (BigDecimal) row[1];
            log.debug("User {} balance: {}", userId, balance);

            if (balance.compareTo(BigDecimal.ZERO) < 0) {
                debtors.add(new UserBalance(userId, balance.abs()));
                log.debug("Added debtor: {} with amount: {}", userId, balance.abs());
            } else if (balance.compareTo(BigDecimal.ZERO) > 0) {
                creditors.add(new UserBalance(userId, balance));
                log.debug("Added creditor: {} with amount: {}", userId, balance);
            }
        }

        List<SettlementStep> steps = new ArrayList<>();
        int dIdx = 0, cIdx = 0;

        log.debug("Debtors count: {}, Creditors count: {}", debtors.size(), creditors.size());
        
        while (dIdx < debtors.size() && cIdx < creditors.size()) {
            UserBalance debtor = debtors.get(dIdx);
            UserBalance creditor = creditors.get(cIdx);

            BigDecimal amountToTransfer = debtor.amount.min(creditor.amount);

            if (amountToTransfer.compareTo(BigDecimal.ZERO) > 0) {
                steps.add(new SettlementStep(debtor.userId, creditor.userId, amountToTransfer));
                log.debug("Created settlement step: {} -> {} : {}", debtor.userId, creditor.userId, amountToTransfer);
            }

            debtor.amount = debtor.amount.subtract(amountToTransfer);
            creditor.amount = creditor.amount.subtract(amountToTransfer);

            if (debtor.amount.compareTo(BigDecimal.ZERO) == 0) dIdx++;
            if (creditor.amount.compareTo(BigDecimal.ZERO) == 0) cIdx++;
        }

        log.debug("Calculated {} settlement steps for event: {}", steps.size(), eventId);
        if (steps.isEmpty()) {
            log.info("No settlement steps calculated for event: {} - either no debts or all balances are zero", eventId);
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
