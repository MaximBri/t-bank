package com.tbank.tevent.repo;

import com.tbank.tevent.event.dto.ParticipantResponse;
import com.tbank.tevent.repo.entity.EventUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventUserRepository extends JpaRepository<EventUser, UUID> {

    boolean existsByEventIdAndUserId(UUID eventId, UUID userId);

    Optional<EventUser> findByEventIdAndUserId(UUID eventId, UUID userId);

    Long countByEventId(UUID eventId);

    @Query("""
           SELECT new com.tbank.tevent.repo.EventParticipantCount(eu.eventId, COUNT(eu)) 
           FROM EventUser eu 
           WHERE eu.eventId IN :eventIds 
           GROUP BY eu.eventId
           """)
    List<EventParticipantCount> countParticipantsByEventIds(@Param("eventIds") List<UUID> eventIds);

    @Query("""
        SELECT u.id as userId, u.login as login, u.firstName as firstName, u.secondName as lastName, u.avatarUrl as avatarUrl
        FROM EventUser eu, User u
        WHERE eu.userId = u.id
          AND eu.eventId = :eventId
        ORDER BY u.login ASC
    """)
    List<ParticipantResponse> findAllParticipantsByEventId(@Param("eventId") UUID eventId);
}
