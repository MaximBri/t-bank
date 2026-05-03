package com.tbank.tevent.repo;

import com.tbank.tevent.repo.entity.Event;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {
    @Query(value = """
        SELECT DISTINCT e.id, e.title, e.description, e.start_date, e.end_date,
               e.category, e.image_key, e.owner_id, e.created_at, e.updated_at
        FROM event e
        JOIN event_user eu ON eu.event_id = e.id
        WHERE eu.user_id = :userId
        AND (CAST(:search AS text) IS NULL
             OR e.title ILIKE CONCAT('%', CAST(:search AS text), '%')
             OR e.description ILIKE CONCAT('%', CAST(:search AS text), '%'))
        AND (CAST(:startDate AS timestamp) IS NULL OR e.start_date >= :startDate)
        AND (CAST(:endDate AS timestamp) IS NULL OR e.end_date <= :endDate)
        AND (CAST(:minParticipants AS integer) IS NULL
             OR (SELECT COUNT(*) FROM event_user eu2
                 WHERE eu2.event_id = e.id) >= :minParticipants)
        AND (CAST(:maxParticipants AS integer) IS NULL
             OR (SELECT COUNT(*) FROM event_user eu2
                 WHERE eu2.event_id = e.id) <= :maxParticipants)
        ORDER BY e.start_date DESC
        """, nativeQuery = true)
    List<Event> findUserEvents(@Param("userId") UUID userId,
                               @Param("search") String search,
                               @Param("startDate") LocalDateTime startDate,
                               @Param("endDate") LocalDateTime endDate,
                               @Param("minParticipants") Integer minParticipants,
                               @Param("maxParticipants") Integer maxParticipants);

    Optional<Event> findByInviteToken(String inviteToken);
}

