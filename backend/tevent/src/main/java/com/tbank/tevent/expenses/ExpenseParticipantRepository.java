package com.tbank.tevent.expenses;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ExpenseParticipantRepository extends JpaRepository<ExpenseParticipant, UUID> {
    int countByExpenseId(UUID expenseId);
    int countByExpenseIdAndHasResponded(UUID expenseId, Boolean hasResponded);
    Optional<ExpenseParticipant> findByExpenseIdAndUserId(UUID expenseId, UUID userId);
}
