package com.tbank.tevent.repo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Setter
@Getter
@Table(name = "event_user")
public class EventUser {
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

    @Column(name = "role", nullable = false)
    private String role; // OWNER, PARTICIPANT

    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;
}
