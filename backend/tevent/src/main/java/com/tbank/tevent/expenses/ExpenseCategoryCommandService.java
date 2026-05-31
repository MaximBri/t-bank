package com.tbank.tevent.expenses;

import com.tbank.tevent.repo.CategoryRepository;
import com.tbank.tevent.repo.ExpenseCategoryRepository;
import com.tbank.tevent.repo.entity.ExpenseCategory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ExpenseCategoryCommandService {

    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final CategoryRepository categoryRepository;

    public void syncCategories(UUID expenseId, UUID eventId, List<String> names) {
        if (names == null || names.isEmpty()) {
            return;
        }
        log.debug("Syncing expense categories, expenseId={}, namesCount={}", expenseId, names.size());

        List<String> cleanNames = names.stream()
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .distinct()
                .toList();

        if (cleanNames.isEmpty()) {
            return;
        }

        Map<String, UUID> allowedCategoryIdsByName = new HashMap<>();
        categoryRepository.findAllByEventId(eventId)
                .forEach(category -> allowedCategoryIdsByName.putIfAbsent(category.name(), category.id()));

        List<String> missingCategories = cleanNames.stream()
                .filter(name -> !allowedCategoryIdsByName.containsKey(name))
                .toList();

        if (!missingCategories.isEmpty()) {
            throw new IllegalArgumentException("Categories do not belong to an event: " + String.join(", ", missingCategories));
        }

        List<ExpenseCategory> expenseCategories = cleanNames.stream()
                .map(name -> ExpenseCategory.builder()
                        .expenseId(expenseId)
                        .categoryId(allowedCategoryIdsByName.get(name))
                        .build())
                .toList();

        expenseCategoryRepository.saveAll(expenseCategories);
    }

    public void deleteByExpenseId(UUID expenseId) {
        log.debug("Deleting expense categories, expenseId={}", expenseId);
        expenseCategoryRepository.deleteAllByExpenseId(expenseId);
        expenseCategoryRepository.flush();
    }
}
