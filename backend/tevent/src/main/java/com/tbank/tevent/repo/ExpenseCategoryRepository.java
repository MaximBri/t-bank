package com.tbank.tevent.repo;

import com.tbank.tevent.repo.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, UUID> {
    void deleteAllByExpenseId(UUID expenseId);
    @Query("""
    SELECT ec.expenseId as expenseId, c.name as categoryName 
    FROM ExpenseCategory ec 
    JOIN Category c ON ec.categoryId = c.id 
    WHERE ec.expenseId IN :expenseIds
""")
    List<ExpenseCategoryNameView> findAllCategoryNamesByExpenseIds(@Param("expenseIds") List<UUID> expenseIds);
}
