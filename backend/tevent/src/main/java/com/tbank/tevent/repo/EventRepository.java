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
      AND (CAST(:search AS varchar) IS NULL OR e.title ILIKE '%' || :search || '%')
      AND (CAST(:startDate AS timestamp) IS NULL OR e.start_date >= CAST(:startDate AS timestamp))
      AND (CAST(:endDate AS timestamp) IS NULL OR e.end_date <= CAST(:endDate AS timestamp))
      AND (CAST(:state AS varchar) IS NULL OR e.state = :state)
      AND (
        SELECT COUNT(*) FROM event_user eu2 WHERE eu2.event_id = e.id
      ) BETWEEN COALESCE(CAST(:minPart AS integer), 0) AND COALESCE(CAST(:maxPart AS integer), 999999)
    """, nativeQuery = true)
    List<Event> findUserEventsWithFilters(
            @Param("userId") UUID userId,
            @Param("search") String search,
            @Param("state") String state,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("minPart") Integer minPart,
            @Param("maxPart") Integer maxPart
    );

    Optional<Event> findByInviteTokenId(UUID inviteTokenId);

    Optional<Event> findById(@Param("id") UUID id);
}
