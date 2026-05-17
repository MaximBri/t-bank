package com.tbank.tevent.repo;

import com.tbank.tevent.repo.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
    List<Expense> findAllByEventIdAndStatus(UUID eventId, String status);
    List<Expense> findAllByEventIdAndStatusInOrderByCreatedAtDesc(UUID eventId, List<String> statuses);
    List<Expense> findAllByPayerIdAndStatus(UUID payerId, String status);
    Optional<Expense> findByIdAndEventId(UUID id, UUID eventId);
    List<Expense> findAllByEventIdOrderByCreatedAtDesc(UUID eventId);
    @Query(value = """
        SELECT user_id, SUM(delta) AS net_balance 
        FROM (
            SELECT e.payer_id AS user_id, e.amount AS delta 
            FROM expense e 
            WHERE e.event_id = :eventId AND e.status = 'CONFIRMED'
            
            UNION ALL
            
            SELECT es.user_id AS user_id, -es.amount AS delta 
            FROM expense_split es
            JOIN expense e ON es.expense_id = e.id
            WHERE e.event_id = :eventId AND e.status = 'CONFIRMED'
            
            UNION ALL
            
            SELECT p.from_user_id AS user_id, p.amount AS delta 
            FROM payment p
            WHERE p.event_id = :eventId AND p.status IN ('SENT', 'COMPLETED')
            
            UNION ALL
            
            SELECT p.to_user_id AS user_id, -p.amount AS delta 
            FROM payment p
            WHERE p.event_id = :eventId AND p.status IN ('SENT', 'COMPLETED')
        ) as historical_ledger 
        GROUP BY user_id
        HAVING SUM(delta) != 0
        """, nativeQuery = true)
    List<Object[]> findRawBalancesForEvent(@Param("eventId") UUID eventId);
}
