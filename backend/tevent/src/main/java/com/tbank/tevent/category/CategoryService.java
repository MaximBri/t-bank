package com.tbank.tevent.category;

import com.tbank.tevent.category.dto.CategoryResponse;
import com.tbank.tevent.repo.CategoryEventRepository;
import com.tbank.tevent.repo.CategoryRepository;
import com.tbank.tevent.repo.entity.Category;
import com.tbank.tevent.repo.entity.CategoryEvent;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
        categoryEventRepository.deleteAllByEventId(eventId);
        categoryEventRepository.flush();

        if (categoryNames == null || categoryNames.isEmpty()) {
            return;
        }

        List<String> cleanNames = categoryNames.stream()
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .distinct()
                .toList();

        List<Category> existingCategories = categoryRepository.findAllByNameIn(cleanNames);

        Map<String, UUID> nameToIdMap = existingCategories.stream()
                .collect(Collectors.toMap(Category::getName, Category::getId, (left, right) -> left));

        List<Category> newCategories = cleanNames.stream()
                .filter(name -> !nameToIdMap.containsKey(name))
                .map(name -> Category.builder()
                        .name(name)
                        .build())
                .toList();

        if (!newCategories.isEmpty()) {
            List<Category> savedNew = categoryRepository.saveAll(newCategories);
            savedNew.forEach(c -> nameToIdMap.put(c.getName(), c.getId()));
        }

        List<CategoryEvent> relations = nameToIdMap.values().stream()
                .distinct()
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
