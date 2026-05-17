package com.tbank.tevent.history;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "event_history")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.UUID)
    private UUID id;

    @Column(name = "event_id", nullable = false)
    @JdbcTypeCode(SqlTypes.UUID)
    private UUID eventId;

    @Column(name = "user_id", nullable = false)
    @JdbcTypeCode(SqlTypes.UUID)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false)
    private ActionType actionType;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = false, length = 500)
    private String firstName;

    @Column(nullable = false, length = 500)
    private String secondName;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
