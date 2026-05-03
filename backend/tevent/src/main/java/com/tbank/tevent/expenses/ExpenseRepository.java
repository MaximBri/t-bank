package com.tbank.tevent.expenses;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    @EntityGraph(attributePaths = {"category", "payer"})
    List<Expense> findByEventIdOrderByCreatedAtDesc(UUID eventId);

    @Override
    @EntityGraph(attributePaths = {"category", "payer"})
    Optional<Expense> findById(UUID id);
}
