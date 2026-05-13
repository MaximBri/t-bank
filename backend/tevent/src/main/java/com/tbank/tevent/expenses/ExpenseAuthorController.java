package com.tbank.tevent.expenses;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/events/{eventId}/expenses")
@RequiredArgsConstructor
public class ExpenseAuthorController {

    private final ExpenseAuthorService authorService;

    @PostMapping
    public ResponseEntity<UUID> create(@PathVariable UUID eventId, @RequestBody CreateExpenseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authorService.createExpense(eventId, request));
    }

    @PatchMapping("/{expenseId}")
    public ResponseEntity<Void> update(@PathVariable UUID eventId, @PathVariable UUID expenseId,
                                       @RequestBody CreateExpenseRequest request) {
        authorService.updateExpense(eventId, expenseId, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> delete(@PathVariable UUID eventId, @PathVariable UUID expenseId) {
        authorService.deleteExpense(eventId, expenseId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{expenseId}/approve")
    public ResponseEntity<Void> approve(@PathVariable UUID eventId, @PathVariable UUID expenseId) {
        authorService.approveExpense(eventId, expenseId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{expenseId}/reject")
    public ResponseEntity<Void> reject(@PathVariable UUID eventId, @PathVariable UUID expenseId) {
        authorService.rejectExpense(eventId, expenseId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<EventExpensesResponse> getEventExpenses(@PathVariable UUID eventId) {
        return ResponseEntity.ok(authorService.getEventExpenses(eventId));
    }
}
