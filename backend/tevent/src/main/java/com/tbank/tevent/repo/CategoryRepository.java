package com.tbank.tevent.repo;

import com.tbank.tevent.category.dto.CategoryResponse;
import com.tbank.tevent.repo.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findAllByNameIn(Collection<String> names);

    @Query("""
        SELECT c.id as id, c.name as name, ce.eventId as eventId
        FROM Category c, CategoryEvent ce
        WHERE c.id = ce.categoryId
          AND ce.eventId = :eventId
        ORDER BY c.name ASC
    """)
    List<CategoryResponse> findAllByEventId(@Param("eventId") UUID eventId);

    @Query("""
        SELECT c.id as id, c.name as name, ce.eventId as eventId
        FROM Category c, CategoryEvent ce
        WHERE c.id = ce.categoryId
          AND ce.eventId IN :eventIds
        ORDER BY c.name ASC
    """)
    List<CategoryResponse> findAllByEventIds(@Param("eventIds") List<UUID> eventIds);
}
