package com.tbank.tevent.application.controller;

import com.tbank.tevent.application.dto.request.CreateExpenseRequest;
import com.tbank.tevent.application.dto.response.ExpenseDTO;
import com.tbank.tevent.application.service.ExpenseService;
import com.tbank.tevent.domain.model.ExpenseApprovalStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Контроллер для управления расходами.
 */
@RestController
@RequestMapping("/api/v1/events/{eventId}/expenses")
@Tag(name = "Expenses", description = "Добавление, редактирование и подтверждение расходов")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    @Operation(summary = "Получить список расходов события")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Список расходов получен"),
            @ApiResponse(responseCode = "404", description = "Событие не найдено")
    })
    public ResponseEntity<List<ExpenseDTO>> getExpenses(
            @PathVariable @Parameter(description = "ID события") Integer eventId) {
        List<ExpenseDTO> expenses = expenseService.getEventExpenses(eventId);
        return ResponseEntity.ok(expenses);
    }

    @PostMapping
    @Operation(summary = "Создать новый расход")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Расход создан"),
            @ApiResponse(responseCode = "400", description = "Некорректные данные"),
            @ApiResponse(responseCode = "404", description = "Событие или участники не найдены"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав")
    })
    public ResponseEntity<ExpenseDTO> createExpense(
            @PathVariable @Parameter(description = "ID события") Integer eventId,
            @RequestBody @Valid CreateExpenseRequest request) {
        ExpenseDTO expense = expenseService.createExpense(eventId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(expense);
    }

    @GetMapping("/{expenseId}")
    @Operation(summary = "Получить расход по ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Расход получен"),
            @ApiResponse(responseCode = "404", description = "Расход не найден")
    })
    public ResponseEntity<ExpenseDTO> getExpense(
            @PathVariable @Parameter(description = "ID события") Integer eventId,
            @PathVariable @Parameter(description = "ID расхода") Integer expenseId) {
        ExpenseDTO expense = expenseService.getExpense(expenseId);
        return ResponseEntity.ok(expense);
    }

    @PatchMapping("/{expenseId}/status")
    @Operation(summary = "Обновить статус подтверждения расхода")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Статус обновлен"),
            @ApiResponse(responseCode = "404", description = "Расход не найден"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав")
    })
    public ResponseEntity<Void> updateExpenseStatus(
            @PathVariable @Parameter(description = "ID события") Integer eventId,
            @PathVariable @Parameter(description = "ID расхода") Integer expenseId,
            @RequestParam @Parameter(description = "Новый статус") ExpenseApprovalStatus status) {
        expenseService.updateExpenseStatus(expenseId, status);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/{expenseId}/dispute")
    @Operation(summary = "Оспорить расход")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Расход оспорен"),
            @ApiResponse(responseCode = "404", description = "Расход не найден"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав")
    })
    public ResponseEntity<Void> disputeExpense(
            @PathVariable @Parameter(description = "ID события") Integer eventId,
            @PathVariable @Parameter(description = "ID расхода") Integer expenseId,
            @RequestParam @Parameter(description = "Причина оспаривания") String reason) {
        expenseService.disputeExpense(expenseId, reason);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @DeleteMapping("/{expenseId}")
    @Operation(summary = "Удалить расход")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Расход удален"),
            @ApiResponse(responseCode = "404", description = "Расход не найден"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав")
    })
    public ResponseEntity<Void> deleteExpense(
            @PathVariable @Parameter(description = "ID события") Integer eventId,
            @PathVariable @Parameter(description = "ID расхода") Integer expenseId) {
        expenseService.deleteExpense(expenseId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/total")
    @Operation(summary = "Получить общую сумму расходов события")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Сумма получена"),
            @ApiResponse(responseCode = "404", description = "Событие не найдено")
    })
    public ResponseEntity<Double> getTotalExpenses(
            @PathVariable @Parameter(description = "ID события") Integer eventId) {
        Double total = expenseService.getTotalExpensesAmount(eventId);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/average")
    @Operation(summary = "Получить среднюю сумму на участника")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Средняя сумма получена"),
            @ApiResponse(responseCode = "404", description = "Событие не найдено")
    })
    public ResponseEntity<Double> getAveragePerParticipant(
            @PathVariable @Parameter(description = "ID события") Integer eventId) {
        Double average = expenseService.getAveragePerParticipant(eventId);
        return ResponseEntity.ok(average);
    }

    @GetMapping("/pending")
    @Operation(summary = "Получить расходы, требующие подтверждения")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Список расходов получен"),
            @ApiResponse(responseCode = "404", description = "Событие не найдено")
    })
    public ResponseEntity<List<ExpenseDTO>> getPendingExpenses(
            @PathVariable @Parameter(description = "ID события") Integer eventId) {
        List<ExpenseDTO> pendingExpenses = expenseService.getPendingExpenses(eventId);
        return ResponseEntity.ok(pendingExpenses);
    }
}