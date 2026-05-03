package com.tbank.tevent.repo;

import com.tbank.tevent.repo.entity.EventInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventInvitationRepository extends JpaRepository<EventInvitation, UUID> {
    Optional<EventInvitation> findByEventIdAndUserId(UUID eventId, UUID userId);
    List<EventInvitation> findAllByUserIdAndStatus(UUID userId, String status);
    List<EventInvitation> findAllByEventIdAndStatus(UUID eventId, String status);
    boolean existsByEventIdAndUserIdAndStatus(UUID eventId, UUID userId, String status);
    Optional<EventInvitation> findByToken(String token);
    List<EventInvitation> findAllByExpiresAtBeforeAndStatus(java.time.LocalDateTime expiresAt, String status);
}