package com.tbank.tevent.category;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.category.dto.CategoryResponse;
import com.tbank.tevent.repo.entity.Category;
import com.tbank.tevent.repo.entity.CategoryEvent;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryEventRepository categoryEventRepository;

    @Transactional
    public void syncCategoriesWithEvent(UUID eventId, List<String> categoryNames) {
        // Delete existing relations for this event
        categoryEventRepository.deleteAllByEventId(eventId);
        
        if (categoryNames == null || categoryNames.isEmpty()) {
            return;
        }

        List<String> cleanNames = categoryNames.stream()
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .distinct()
                .toList();

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        List<Category> existingCategories = categoryRepository.findAllByUserIdAndNameIn(currentUserId, cleanNames);

        Map<String, UUID> nameToIdMap = existingCategories.stream()
                .collect(Collectors.toMap(Category::getName, Category::getId));

        LocalDateTime now = LocalDateTime.now();
        List<Category> newCategories = cleanNames.stream()
                .filter(name -> !nameToIdMap.containsKey(name))
                .map(name -> Category.builder()
                        .name(name)
                        .userId(currentUserId)
                        .createdAt(now)
                        .build())
                .toList();

        if (!newCategories.isEmpty()) {
            List<Category> savedNew = categoryRepository.saveAll(newCategories);
            savedNew.forEach(c -> nameToIdMap.put(c.getName(), c.getId()));
        }

        List<CategoryEvent> relations = nameToIdMap.values().stream()
                .map(catId -> CategoryEvent.builder()
                        .eventId(eventId)
                        .categoryId(catId)
                        .build())
                .toList();

        categoryEventRepository.saveAll(relations);
    }

    public List<CategoryResponse> findAllByEventId(UUID eventId){
        return categoryRepository.findAllByEventId(eventId);
    }

    public List<CategoryResponse> findAllByEventIds(List<UUID> eventIds){
        return categoryRepository.findAllByEventIds(eventIds);
    }
}
