package com.tbank.tevent.category;

import com.tbank.tevent.repo.entity.CategoryEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CategoryEventRepository extends JpaRepository<CategoryEvent, UUID> {
    List<CategoryEvent> findAllByEventIdOrderByIdAsc(UUID eventId);
}
