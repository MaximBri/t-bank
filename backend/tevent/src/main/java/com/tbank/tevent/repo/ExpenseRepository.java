package com.tbank.tevent.repo;

import com.tbank.tevent.repo.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
    List<Expense> findAllByEventIdAndStatus(UUID eventId, String status);
    List<Expense> findAllByEventIdAndStatusInOrderByCreatedAtDesc(UUID eventId, List<String> statuses);
    List<Expense> findAllByPayerIdAndStatus(UUID payerId, String status);
    Optional<Expense> findByIdAndEventId(UUID id, UUID eventId);
}
