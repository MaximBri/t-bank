package com.tbank.tevent.history;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventHistoryRepository extends JpaRepository<EventHistory, UUID> {
    List<EventHistory> findAllByEventIdOrderByCreatedAtDesc(UUID eventId);
}
