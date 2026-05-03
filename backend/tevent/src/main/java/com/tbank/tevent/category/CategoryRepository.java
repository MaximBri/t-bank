package com.tbank.tevent.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findByEventId(UUID eventId);

    boolean existsByEventIdAndNameIgnoreCase(UUID eventId, String name);

    Optional<Category> findByEventIdAndNameIgnoreCase(UUID eventId, String name);

    Optional<Category> findByIdAndEventId(UUID id, UUID eventId);

    List<Category> findByEventIsNull();

    Optional<Category> findByEventIsNullAndNameIgnoreCase(String name);
}
