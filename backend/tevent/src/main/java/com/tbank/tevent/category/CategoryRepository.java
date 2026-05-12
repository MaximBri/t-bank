package com.tbank.tevent.category;

import com.tbank.tevent.category.dto.CategoryResponse;
import com.tbank.tevent.repo.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    @Query("SELECT c FROM Category c, CategoryEvent ce WHERE c.id = ce.categoryId AND ce.eventId = :eventId")
    List<Category> findByEventId(@Param("eventId") UUID eventId);

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Category c, CategoryEvent ce WHERE c.id = ce.categoryId AND ce.eventId = :eventId AND UPPER(c.name) = UPPER(:name)")
    boolean existsByEventIdAndNameIgnoreCase(@Param("eventId") UUID eventId, @Param("name") String name);

    @Query("SELECT c FROM Category c, CategoryEvent ce WHERE c.id = ce.categoryId AND ce.eventId = :eventId AND UPPER(c.name) = UPPER(:name)")
    Optional<Category> findByEventIdAndNameIgnoreCase(@Param("eventId") UUID eventId, @Param("name") String name);

    @Query("SELECT c FROM Category c, CategoryEvent ce WHERE c.id = ce.categoryId AND c.id = :id AND ce.eventId = :eventId")
    Optional<Category> findByIdAndEventId(@Param("id") UUID id, @Param("eventId") UUID eventId);

    @Query("SELECT c FROM Category c WHERE c.name IN :names AND c.userId = :userId")
    List<Category> findAllByUserIdAndNameIn(@Param("userId") UUID userId, @Param("names") Collection<String> names);

    @Query("SELECT c FROM Category c WHERE c.name IN :names")
    List<Category> findAllByNameIn(@Param("names") Collection<String> names);

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

    Optional<Category> findByName(String name);
}
