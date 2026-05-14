package com.tbank.tevent.repo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_notification")
public class UserNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    @JdbcTypeCode(SqlTypes.UUID)
    private UUID userId;

    @Column(name = "event_id", nullable = false)
    @JdbcTypeCode(SqlTypes.UUID)
    private UUID eventId;

    @Column(name = "expense_id")
    @JdbcTypeCode(SqlTypes.UUID)
    private UUID expenseId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "message", nullable = false)
    private String message;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
