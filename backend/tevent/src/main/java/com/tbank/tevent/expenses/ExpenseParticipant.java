package com.tbank.tevent.expenses;

import com.tbank.tevent.repo.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(
        name = "expense_participant",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "expense_id"})
)
@Getter
@Setter
public class ExpenseParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;

    @Column(name = "has_responded", nullable = false)
    private Boolean hasResponded;
}
