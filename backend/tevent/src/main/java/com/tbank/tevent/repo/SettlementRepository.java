package com.tbank.tevent.repo;

import com.tbank.tevent.repo.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SettlementRepository extends JpaRepository<Settlement, UUID> {
    List<Settlement> findAllByEventId(UUID eventId);
    void deleteAllByEventId(UUID eventId);
}
