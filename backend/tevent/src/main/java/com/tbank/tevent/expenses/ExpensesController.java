package com.tbank.tevent.expenses;

import com.tbank.tevent.expenses.dto.CreateExpenseRequest;
import com.tbank.tevent.expenses.dto.ExpenseDto;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/events")
public class ExpensesController {
    private final ExpensesService expensesService;

    public ExpensesController(ExpensesService expensesService) {
        this.expensesService = expensesService;
    }

    @GetMapping("/{eventId}/expenses")
    public ResponseEntity<List<ExpenseDto>> getExpenses(@PathVariable UUID eventId) {
        return ResponseEntity.ok(expensesService.getAllExpenses(eventId));
    }

    @PostMapping("/{eventId}/expenses")
    public ResponseEntity<ExpenseDto> postExpense(@PathVariable UUID eventId, @Valid @RequestBody CreateExpenseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expensesService.createExpense(eventId, request));
    }

    @PatchMapping("/{expenseId}/status")
    public ResponseEntity<Void> approveExpense(
            @PathVariable UUID expenseId,
            @RequestParam String status,
            @RequestParam(required = false)
            @Parameter(description = "Причина конфликта (обязательна при статусе DISPUTED)") String reason
    ) {
        expensesService.approveExpenseByParticipant(expenseId, status, reason);
        return ResponseEntity.ok().build();
    }
}
