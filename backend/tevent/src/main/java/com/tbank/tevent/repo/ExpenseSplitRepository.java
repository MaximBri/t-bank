package com.tbank.tevent.repo;

import com.tbank.tevent.repo.entity.Expense;
import com.tbank.tevent.repo.entity.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, UUID> {
    List<ExpenseSplit> findAllByExpenseId(UUID expenseId);
    List<ExpenseSplit> findAllByExpenseIdIn(List<UUID> expenseIds);
    Optional<ExpenseSplit> findByExpenseIdAndUserId(UUID expenseId, UUID userId);
    void deleteAllByExpenseId(UUID expenseId);
    boolean existsByExpenseIdAndUserId(UUID expenseId, UUID userId);
    long countByExpenseIdAndIsConfirmedFalse(UUID expenseId);

    @Query("SELECT es FROM ExpenseSplit es JOIN Expense e ON es.expenseId = e.id WHERE es.userId = :userId AND es.isConfirmed = false AND e.status = 'PLANNED'")
    List<ExpenseSplit> findAllPendingIncomes(@Param("userId") UUID userId);

    @Query("SELECT s FROM ExpenseSplit s JOIN Expense e ON s.expenseId = e.id WHERE s.userId = :userId AND e.status IN ('PLANNED', 'PENDING') AND s.isConfirmed = false")
    List<ExpenseSplit> findAllPendingSplitsWithExpense(@Param("userId") UUID userId);

    @Query("SELECT s FROM ExpenseSplit s JOIN Expense e ON s.expenseId = e.id WHERE e.eventId = :eventId AND s.isConfirmed = true")
    List<ExpenseSplit> findAllConfirmedByEventId(@Param("eventId") UUID eventId);
}
