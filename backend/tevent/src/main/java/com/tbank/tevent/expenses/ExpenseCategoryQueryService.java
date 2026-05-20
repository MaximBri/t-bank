package com.tbank.tevent.expenses;

import com.tbank.tevent.repo.ExpenseCategoryNameView;
import com.tbank.tevent.repo.ExpenseCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExpenseCategoryQueryService {
    private final ExpenseCategoryRepository expenseCategoryRepository;

    public Map<UUID, List<String>> loadCategoriesMap(List<UUID> expenseIds) {
        if (expenseIds == null || expenseIds.isEmpty()) {
            return Map.of();
        }

        return expenseCategoryRepository.findAllCategoryNamesByExpenseIds(expenseIds).stream()
                .collect(Collectors.groupingBy(
                        ExpenseCategoryNameView::getExpenseId,
                        Collectors.mapping(ExpenseCategoryNameView::getCategoryName, Collectors.toList())
                ));
    }
}
