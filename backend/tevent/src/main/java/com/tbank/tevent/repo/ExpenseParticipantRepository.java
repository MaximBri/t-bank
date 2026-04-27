package com.tbank.tevent.repo;

import com.tbank.tevent.repo.entity.ExpenseParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ExpenseParticipantRepository extends JpaRepository<ExpenseParticipant, UUID> {
    List<ExpenseParticipant> findAllByExpenseId(UUID expenseId);
    List<ExpenseParticipant> findAllByUserIdAndExpenseIdIn(UUID userId, List<UUID> expenseIds);
}
