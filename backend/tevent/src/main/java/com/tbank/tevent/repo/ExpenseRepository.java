package com.tbank.tevent.repo;

import com.tbank.tevent.repo.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
    List<Expense> findAllByEventIdAndStatusInOrderByCreatedAtDesc(UUID eventId, List<String> statuses);
    List<Expense> findAllByEventIdOrderByCreatedAtDesc(UUID eventId);
}
