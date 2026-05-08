package com.tbank.tevent.repo;

import com.tbank.tevent.repo.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {
    @Query(value = """
        SELECT e.* FROM event e
        JOIN event_user eu ON e.id = eu.event_id
        WHERE eu.user_id = :userId
          AND (:startDate IS NULL OR e.start_date >= :startDate)
          AND (:endDate IS NULL OR e.end_date <= :endDate)
          AND (:state IS NULL OR (
                CASE 
                    WHEN :state = 'planned' THEN e.start_date > NOW()
                    WHEN :state = 'active' THEN e.start_date <= NOW() AND e.end_date >= NOW()
                    WHEN :state = 'completed' THEN e.end_date < NOW()
                    ELSE TRUE
                END
          ))
          AND (
            SELECT COUNT(*) FROM event_user eu2 WHERE eu2.event_id = e.id
          ) BETWEEN COALESCE(:minPart, 0) AND COALESCE(:maxPart, 999999)
        """, nativeQuery = true)
    List<Event> findUserEventsWithFilters(
            @Param("userId") UUID userId,
            @Param("state") String state,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("minPart") Integer minPart,
            @Param("maxPart") Integer maxPart
    );

    Optional<Event> findByInviteTokenId(UUID inviteTokenId);

    @Query("SELECT e FROM Event e WHERE e.inviteTokenId = :inviteTokenId")
    Optional<Event> findByInviteTokenIdQuery(@Param("inviteTokenId") UUID inviteTokenId);
}

