package com.tbank.tevent.expenses;

import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.repo.ExpenseSplitRepository;
import com.tbank.tevent.repo.entity.Expense;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExpenseQueryService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository splitRepository;
    private final ExpenseCategoryQueryService categoryQueryService;

    public EventExpensesResponse getEventExpenses(UUID eventId) {
        List<Expense> expenses = expenseRepository.findAllByEventIdOrderByCreatedAtDesc(eventId);

        if (expenses.isEmpty()) {
            return new EventExpensesResponse(List.of(), BigDecimal.ZERO);
        }

        List<UUID> expenseIds = expenses.stream().map(Expense::getId).toList();

        Map<UUID, List<String>> categoriesMap = categoryQueryService.loadCategoriesMap(expenseIds);

        Map<UUID, List<UUID>> participantsMap = splitRepository.findAllParticipantsByExpenseIds(expenseIds).stream()
                .collect(Collectors.groupingBy(
                        ExpenseParticipantView::getExpenseId,
                        Collectors.mapping(ExpenseParticipantView::getUserId, Collectors.toList())
                ));

        List<ExpenseResponse> expenseResponses = expenses.stream()
                .map(expense -> {
                    List<UUID> allParticipants = participantsMap.getOrDefault(expense.getId(), List.of());
                    int totalCount = allParticipants.size();

                    List<UUID> firstTen = allParticipants.stream()
                            .limit(10)
                            .toList();

                    return new ExpenseResponse(
                            expense.getId(),
                            expense.getDescription(),
                            expense.getTitle(),
                            expense.getAmount(),
                            expense.getPayerId(),
                            expense.getStatus(),
                            categoriesMap.getOrDefault(expense.getId(), List.of()),
                            firstTen,
                            totalCount,
                            expense.getCreatedAt()
                    );
                })
                .toList();

        BigDecimal totalEventSum = expenses.stream()
                .filter(e -> "ACTIVE".equals(e.getStatus()))
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new EventExpensesResponse(expenseResponses, totalEventSum);
    }
}
