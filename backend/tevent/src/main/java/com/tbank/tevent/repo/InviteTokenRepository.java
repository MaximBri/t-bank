package com.tbank.tevent.repo;

import com.tbank.tevent.invite_token.EventTokenResponse;
import com.tbank.tevent.repo.entity.InviteToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InviteTokenRepository extends JpaRepository<InviteToken, UUID> {
    @Query("SELECT t FROM InviteToken t WHERE t.expiresAt < :now")
    List<InviteToken> findAllExpired(@Param("now") LocalDateTime now);
    Optional<InviteToken> findByToken(String token);
    @Query("""
        SELECT t.token as token, t.expiresAt as expiresAt
        FROM Event e
        JOIN InviteToken t ON e.inviteTokenId = t.id
        WHERE e.id = :eventId
    """)
    Optional<EventTokenResponse> findTokenByEventId(@Param("eventId") UUID eventId);
}
