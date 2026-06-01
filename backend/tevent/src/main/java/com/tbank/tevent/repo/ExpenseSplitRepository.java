package com.tbank.tevent.repo;
import com.tbank.tevent.repo.entity.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, UUID> {
    List<ExpenseSplit> findAllByExpenseId(UUID expenseId);
    Optional<ExpenseSplit> findByExpenseIdAndUserId(UUID expenseId, UUID userId);

    // Есть ли у пользователя доля в любом неудалённом расходе события
    // (защита от удаления/выхода участника с висящими split — рвёт расчёт долгов).
    @Query("""
        SELECT COUNT(s) > 0 FROM ExpenseSplit s JOIN Expense e ON s.expenseId = e.id
        WHERE e.eventId = :eventId AND s.userId = :userId
        """)
    boolean existsSplitForUserInEvent(@Param("eventId") UUID eventId, @Param("userId") UUID userId);

    @Query(value = """
        SELECT user_id, SUM(delta) AS net_balance
        FROM (

            SELECT e.payer_id AS user_id, e.amount AS delta
            FROM expense e
            WHERE e.event_id = :eventId AND e.status = 'ACTIVE'
            
            UNION ALL
            
            SELECT es.user_id AS user_id, -es.amount AS delta
            FROM expense_split es
            JOIN expense e ON es.expense_id = e.id
            WHERE e.event_id = :eventId AND e.status = 'ACTIVE' AND es.is_confirmed = true
            
            UNION ALL

            SELECT e.payer_id AS user_id, -(e.amount / (COUNT(es.user_id) + 1)) AS delta
            FROM expense e
            JOIN expense_split es ON es.expense_id = e.id
            WHERE e.event_id = :eventId AND e.status = 'ACTIVE' AND es.is_confirmed = true
            GROUP BY e.id, e.payer_id, e.amount
        ) AS ledger
        GROUP BY user_id
        HAVING SUM(delta) != 0
        """, nativeQuery = true)
    List<Object[]> findNetBalancesByEventId(@Param("eventId") UUID eventId);

    void deleteByExpenseId(UUID expenseId);

    @Query("""
        SELECT s.expenseId as expenseId, s.userId as userId 
        FROM ExpenseSplit s 
        WHERE s.expenseId IN :expenseIds
        """)
    List<ExpenseParticipantView> findAllParticipantsByExpenseIds(@Param("expenseIds") List<UUID> expenseIds);

    @Query("""
        SELECT s
        FROM ExpenseSplit s
        JOIN Expense e ON e.id = s.expenseId
        JOIN Event ev ON ev.id = e.eventId
        WHERE s.userId = :userId
          AND s.isConfirmed = false
          AND e.status = 'PENDING'
          AND ev.isCompleted = false
        """)
    List<ExpenseSplit> findPendingInboxSplits(@Param("userId") UUID userId);
}
