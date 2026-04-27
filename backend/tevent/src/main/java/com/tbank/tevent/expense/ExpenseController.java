package com.tbank.tevent.expense;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping("/events/{eventId}/expenses")
    public ResponseEntity<ExpensesResponse> getExpenses(@PathVariable UUID eventId) {
        return ResponseEntity.ok(expenseService.getExpenses(eventId));
    }

    @PostMapping("/events/{eventId}/expenses")
    public ResponseEntity<ExpenseDTO> createExpense(@PathVariable UUID eventId,
                                                    @Valid @RequestBody CreateExpenseRequest request) {
        ExpenseDTO expense = expenseService.createExpense(eventId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(expense);
    }

    @PatchMapping("/expenses/{expenseId}/status")
    public ResponseEntity<Void> updateExpenseStatus(@PathVariable UUID expenseId,
                                                    @Valid @RequestBody ExpenseUpdateStatusRequest request) {
        expenseService.updateStatus(expenseId, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/events/{eventId}/settlements")
    public ResponseEntity<SettlementsResponse> getSettlements(@PathVariable UUID eventId) {
        return ResponseEntity.ok(expenseService.getSettlements(eventId));
    }

    @PostMapping("/settlements/{settlementId}/pay")
    public ResponseEntity<Void> pay(@PathVariable UUID settlementId) {
        expenseService.pay(settlementId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/settlements/{settlementId}/confirm")
    public ResponseEntity<Void> confirm(@PathVariable UUID settlementId) {
        expenseService.confirm(settlementId);
        return ResponseEntity.ok().build();
    }
}
