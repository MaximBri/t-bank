package com.tbank.tevent.category;

import com.tbank.tevent.category.dto.CategoryDto;
import com.tbank.tevent.category.dto.CreateCategoryRequest;
import com.tbank.tevent.category.exception.CategoryAlreadyExistsException;
import com.tbank.tevent.category.exception.CategoryNotFoundException;
import com.tbank.tevent.category.exception.EventNotFoundException;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.entity.Event;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {

    private static final Logger log = LoggerFactory.getLogger(CategoryService.class);

    private final CategoryRepository categoryRepository;
    private final EventRepository eventRepository;
    private final EntityManager entityManager;

    public CategoryService(CategoryRepository categoryRepository, EventRepository eventRepository, EntityManager entityManager) {
        this.categoryRepository = categoryRepository;
        this.eventRepository = eventRepository;
        this.entityManager = entityManager;
    }

    @Transactional
    public List<CategoryDto> getAllEventCategories(UUID eventId) {
        List<CategoryDto> categories = categoryRepository.findByEventId(eventId).stream()
                .map(this::toDto)
                .toList();

        log.info("Fetched categories for eventId={}, count={}", eventId, categories.size());
        return categories;
    }

    public List<CategoryDto> getAllDefaultCategories() {
        List<CategoryDto> categories = categoryRepository.findByEventIsNull().stream()
                .map(this::toDto)
                .toList();

        log.info("Fetched default categories, count={}", categories.size());
        return categories;
    }

    @Transactional
    public CategoryDto createEventCategory(CreateCategoryRequest request, UUID eventId) {
        String name = request.name().trim();

        if (categoryRepository.existsByEventIdAndNameIgnoreCase(eventId, name)) {
            log.info("Category creation rejected: duplicate name, eventId={}, name={}", eventId, name);
            throw new CategoryAlreadyExistsException();
        }

        if (!eventRepository.existsById(eventId)) {
            log.info("Category creation rejected: event not found, eventId={}", eventId);
            throw new EventNotFoundException();
        }

        Category category = new Category();
        category.setName(name);
        category.setEvent(entityManager.getReference(Event.class, eventId));

        Category savedCategory = categoryRepository.saveAndFlush(category);
        log.info("Category created successfully, categoryId={}, eventId={}, name={}",
                savedCategory.getId(), eventId, savedCategory.getName());

        return toDto(savedCategory);
    }

    @Transactional
    public void deleteEventCategory(UUID eventId, UUID categoryId) {
        Category category = categoryRepository.findByIdAndEventId(categoryId, eventId)
                .orElseThrow(() -> {
                    log.info("Category deletion rejected: category not found, categoryId={}, eventId={}", categoryId, eventId);
                    return new CategoryNotFoundException();
                });

        categoryRepository.delete(category);
        log.info("Category deleted successfully, categoryId={}, eventId={}", categoryId, eventId);
    }

    private CategoryDto toDto(Category category) {
        UUID relatedEventId = category.getEvent() != null ? category.getEvent().getId() : null;

        return new CategoryDto(
                category.getId(),
                category.getName(),
                relatedEventId,
                category.getCreatedAt()
        );
    }
}
