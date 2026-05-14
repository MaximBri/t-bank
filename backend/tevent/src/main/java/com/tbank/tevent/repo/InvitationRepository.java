package com.tbank.tevent.repo;

import com.tbank.tevent.invitations.dto.MyInvitationResponse;
import com.tbank.tevent.invitations.dto.OwnerInvitationResponse;
import com.tbank.tevent.repo.entity.EventInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface InvitationRepository extends JpaRepository<EventInvitation, UUID> {
    boolean existsByEventIdAndUserId(UUID eventId, UUID userId);

    List<EventInvitation> findAllByUserId(UUID userId);

    List<EventInvitation> findAllByEventIdAndStatus(UUID eventId, String status);

    @Query("""
        SELECT i.id as id, e.title as title, i.status as status, i.createdAt as createdAt
        FROM EventInvitation i, Event e
        WHERE i.eventId = e.id
          AND i.userId = :userId
    """)
    List<MyInvitationResponse> findUserOutbox(@Param("userId") UUID userId);

    @Query("""
        SELECT i.id as id, e.title as title, u.login as login, i.status as status, i.createdAt as createdAt
        FROM EventInvitation i, Event e, User u
        WHERE i.eventId = e.id
          AND i.userId = u.id
          AND e.ownerId = :ownerId
          AND i.status = 'PENDING'
    """)
    List<OwnerInvitationResponse> findOwnerInbox(@Param("ownerId") UUID ownerId);
}
