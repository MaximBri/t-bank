package com.tbank.tevent.expenses;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.expenses.dto.CreateExpenseRequest;
import com.tbank.tevent.expenses.dto.EventExpensesResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/events/{eventId}/expenses")
@RequiredArgsConstructor
@Tag(name = "Event Expenses", description = "Управление расходами события")
public class EventExpenseController {

    private final ExpenseCommandService commandService;
    private final ExpenseQueryService queryService;

    @PostMapping
    @Operation(summary = "Создать расход")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Расход создан"),
            @ApiResponse(responseCode = "400", description = "Некорректный запрос"),
            @ApiResponse(responseCode = "404", description = "Событие не найдено")
    })
    public ResponseEntity<UUID> create(@PathVariable UUID eventId, @Valid @RequestBody CreateExpenseRequest request) {
        UUID authorId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(commandService.create(authorId, eventId, request));
    }

    @PatchMapping("/{expenseId}")
    @Operation(summary = "Обновить расход")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Расход обновлен"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав"),
            @ApiResponse(responseCode = "404", description = "Расход не найден")
    })
    public ResponseEntity<Void> update(@PathVariable UUID eventId, @PathVariable UUID expenseId,
                                       @Valid @RequestBody CreateExpenseRequest request) {
        UUID authorId = SecurityUtils.getCurrentUserId();
        commandService.update(eventId, expenseId, authorId, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{expenseId}")
    @Operation(summary = "Удалить расход")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Расход удален"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав"),
            @ApiResponse(responseCode = "404", description = "Расход не найден")
    })
    public ResponseEntity<Void> delete(@PathVariable UUID eventId, @PathVariable UUID expenseId) {
        UUID authorId = SecurityUtils.getCurrentUserId();
        commandService.delete(eventId, expenseId, authorId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "Получить расходы события")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Список расходов получен")
    })
    public ResponseEntity<EventExpensesResponse> getEventExpenses(@PathVariable UUID eventId) {
        return ResponseEntity.ok(queryService.getEventExpenses(eventId));
    }
}
