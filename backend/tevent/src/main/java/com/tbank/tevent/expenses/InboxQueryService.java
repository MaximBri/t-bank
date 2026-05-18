package com.tbank.tevent.expenses;

import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.repo.ExpenseSplitRepository;
import com.tbank.tevent.repo.entity.Expense;
import com.tbank.tevent.repo.entity.ExpenseSplit;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InboxQueryService {

    private final ExpenseSplitRepository splitRepository;
    private final ExpenseRepository expenseRepository;

    public ListInboxItemDTO getUserInbox(UUID userId) {
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
                        throw new IllegalStateException("Нарушена целостность данных: расход не найден для сплита с ID: " + split.getId());
                    }

                    return new InboxItemDTO(
                            expense.getId(),
                            expense.getTitle(),
                            split.getAmount(),
                            expense.getStatus()
                    );
                })
                .toList();
        return new ListInboxItemDTO(list);
    }
}
