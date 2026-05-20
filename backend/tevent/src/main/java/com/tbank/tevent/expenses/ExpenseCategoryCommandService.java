package com.tbank.tevent.expenses;

import com.tbank.tevent.category.CategoryRepository;
import com.tbank.tevent.repo.ExpenseCategoryRepository;
import com.tbank.tevent.repo.entity.Category;
import com.tbank.tevent.repo.entity.ExpenseCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseCategoryCommandService {

    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final CategoryRepository categoryRepository;

    public void syncCategories(UUID expenseId, List<String> names) {
        if (names == null || names.isEmpty()) return;

        for (String name : names) {
            Category category = categoryRepository.findByName(name)
                    .orElseGet(() -> categoryRepository.save(
                            Category.builder().name(name).build()
                    ));

            ExpenseCategory ec = new ExpenseCategory();
            ec.setExpenseId(expenseId);
            ec.setCategoryId(category.getId());

            expenseCategoryRepository.save(ec);
        }
    }

    public void deleteByExpenseId(UUID expenseId) {
        expenseCategoryRepository.deleteAllByExpenseId(expenseId);
    }
}
