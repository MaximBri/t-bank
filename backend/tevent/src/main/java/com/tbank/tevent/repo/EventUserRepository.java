package com.tbank.tevent.repo;

import com.tbank.tevent.repo.entity.EventUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventUserRepository extends JpaRepository<EventUser, UUID> {

    boolean existsByEventIdAndUserId(UUID eventId, UUID userId);

    Optional<EventUser> findByEventIdAndUserId(UUID eventId, UUID userId);

    Long countByEventId(UUID eventId);

    List<EventUser> findAllByEventId(UUID eventId);

    List<EventUser> findAllByEventIdAndStatus(UUID eventId, String status);

    Optional<EventUser> findByEventIdAndUserIdAndStatus(UUID eventId, UUID userId, String status);

    boolean existsByEventIdAndUserIdAndRole(UUID eventId, UUID userId, String role);
}
