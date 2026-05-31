package com.tbank.tevent.expenses;

import com.tbank.tevent.expenses.dto.InboxItemDTO;
import com.tbank.tevent.expenses.dto.ListInboxItemDTO;
import com.tbank.tevent.expenses.exception.ExpenseSplitIntegrityException;
import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.repo.ExpenseSplitRepository;
import com.tbank.tevent.repo.entity.Expense;
import com.tbank.tevent.repo.entity.ExpenseSplit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InboxQueryService {

    private final ExpenseSplitRepository splitRepository;
    private final ExpenseRepository expenseRepository;

    // Список неподтвержденных расходов для участника
    public ListInboxItemDTO getUserInbox(UUID userId) {
        log.debug("Loading expense inbox for userId={}", userId);
        List<ExpenseSplit> pendingSplits = splitRepository.findAllByUserIdAndIsConfirmedFalse(userId);

        if (pendingSplits.isEmpty()) {
            return new ListInboxItemDTO(List.of());
        }

        List<UUID> expenseIds = pendingSplits.stream()
                .map(ExpenseSplit::getExpenseId)
                .toList();

        Map<UUID, Expense> expensesMap = expenseRepository.findAllById(expenseIds).stream()
                .collect(Collectors.toMap(Expense::getId, Function.identity()));

        List<InboxItemDTO> list=pendingSplits.stream()
                .map(split -> {
                    Expense expense = expensesMap.get(split.getExpenseId());

                    if (expense == null) {
                        throw new ExpenseSplitIntegrityException(split.getId().toString());
                    }

                    return new InboxItemDTO(
                            expense.getId(),
                            expense.getTitle(),
                            split.getAmount(),
                            expense.getStatus()
                    );
                })
                .toList();
        log.debug("Expense inbox loaded, userId={}, size={}", userId, list.size());
        return new ListInboxItemDTO(list);
    }
}
