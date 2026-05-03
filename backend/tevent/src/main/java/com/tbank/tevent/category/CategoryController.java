package com.tbank.tevent.category;

import com.tbank.tevent.category.dto.CategoryDto;
import com.tbank.tevent.category.dto.CreateCategoryRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/events")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getDefaultCategories() {
        return ResponseEntity.ok(categoryService.getAllDefaultCategories());
    }

    @GetMapping("/{eventId}/categories")
    public ResponseEntity<List<CategoryDto>> getCategoriesForEvent(@PathVariable UUID eventId) {
        return ResponseEntity.ok(categoryService.getAllEventCategories(eventId));
    }

    @PostMapping("/{eventId}/categories")
    public ResponseEntity<CategoryDto> createCategoryForEvent(@Valid @RequestBody CreateCategoryRequest request, @PathVariable UUID eventId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createEventCategory(request, eventId));
    }

    @DeleteMapping("/{eventId}/categories/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID eventId, @PathVariable UUID categoryId) {
        categoryService.deleteEventCategory(eventId, categoryId);
        return ResponseEntity.noContent().build();
    }
}
