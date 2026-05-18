package com.tbank.tevent.expenses;

import com.tbank.tevent.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/events/{eventId}/expenses")
@RequiredArgsConstructor
public class ExpenseAuthorController {

    private final ExpenseCommandService commandService;
    private final ExpenseQueryService queryService;

    @PostMapping
    public ResponseEntity<UUID> create(@PathVariable UUID eventId, @RequestBody CreateExpenseRequest request) {
        UUID authorId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(commandService.create(authorId, eventId, request));
    }

    @PatchMapping("/{expenseId}")
    public ResponseEntity<Void> update(@PathVariable UUID eventId, @PathVariable UUID expenseId,
                                       @RequestBody CreateExpenseRequest request) {
        commandService.update(eventId, expenseId, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> delete(@PathVariable UUID eventId, @PathVariable UUID expenseId) {
        commandService.delete(eventId, expenseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<EventExpensesResponse> getEventExpenses(@PathVariable UUID eventId) {
        return ResponseEntity.ok(queryService.getEventExpenses(eventId));
    }
}
