package com.tbank.tevent.application.controller;

import com.tbank.tevent.application.dto.response.SettlementDTO;
import com.tbank.tevent.application.service.SettlementService;
import com.tbank.tevent.domain.model.SettlementStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Контроллер для управления взаиморасчетами.
 */
@RestController
@RequestMapping("/api/v1/events/{eventId}/settlements")
@Tag(name = "Settlements", description = "Взаиморасчеты между участниками, оплата долгов")
public class SettlementController {

    private final SettlementService settlementService;

    public SettlementController(SettlementService settlementService) {
        this.settlementService = settlementService;
    }

    @GetMapping
    @Operation(summary = "Получить список взаиморасчетов для события")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Список взаиморасчетов получен"),
            @ApiResponse(responseCode = "404", description = "Событие не найдено")
    })
    public ResponseEntity<List<SettlementDTO>> getSettlements(
            @PathVariable @Parameter(description = "ID события") Integer eventId) {
        List<SettlementDTO> settlements = settlementService.getEventSettlements(eventId);
        return ResponseEntity.ok(settlements);
    }

    @GetMapping("/debts")
    @Operation(summary = "Получить список долгов текущего пользователя в событии")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Список долгов получен"),
            @ApiResponse(responseCode = "404", description = "Событие не найдено")
    })
    public ResponseEntity<List<SettlementDTO>> getUserDebts(
            @PathVariable @Parameter(description = "ID события") Integer eventId) {
        List<SettlementDTO> debts = settlementService.getUserDebts(eventId);
        return ResponseEntity.ok(debts);
    }

    @PostMapping("/{settlementId}/pay")
    @Operation(summary = "Инициировать оплату долга")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Оплата инициирована"),
            @ApiResponse(responseCode = "404", description = "Взаиморасчет не найден"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав"),
            @ApiResponse(responseCode = "409", description = "Взаиморасчет уже в процессе оплаты")
    })
    public ResponseEntity<Void> initiatePayment(
            @PathVariable @Parameter(description = "ID события") Integer eventId,
            @PathVariable @Parameter(description = "ID взаиморасчета") Integer settlementId) {
        settlementService.initiatePayment(settlementId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/{settlementId}/confirm")
    @Operation(summary = "Подтвердить получение оплаты")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Оплата подтверждена"),
            @ApiResponse(responseCode = "404", description = "Взаиморасчет не найден"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав"),
            @ApiResponse(responseCode = "409", description = "Взаиморасчет не в состоянии ожидания подтверждения")
    })
    public ResponseEntity<Void> confirmPayment(
            @PathVariable @Parameter(description = "ID события") Integer eventId,
            @PathVariable @Parameter(description = "ID взаиморасчета") Integer settlementId) {
        settlementService.confirmPayment(settlementId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @DeleteMapping("/{settlementId}")
    @Operation(summary = "Отменить взаиморасчет")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Взаиморасчет отменен"),
            @ApiResponse(responseCode = "404", description = "Взаиморасчет не найден"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав"),
            @ApiResponse(responseCode = "409", description = "Взаиморасчет уже завершен")
    })
    public ResponseEntity<Void> cancelSettlement(
            @PathVariable @Parameter(description = "ID события") Integer eventId,
            @PathVariable @Parameter(description = "ID взаиморасчета") Integer settlementId) {
        settlementService.cancelSettlement(settlementId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/recalculate")
    @Operation(summary = "Пересчитать взаиморасчеты для события")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "202", description = "Пересчет запущен"),
            @ApiResponse(responseCode = "404", description = "Событие не найдено"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав")
    })
    public ResponseEntity<Void> recalculateSettlements(
            @PathVariable @Parameter(description = "ID события") Integer eventId) {
        settlementService.recalculateSettlements(eventId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }

    @GetMapping("/total-debt")
    @Operation(summary = "Получить общую сумму долгов пользователя в событии")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Сумма долгов получена"),
            @ApiResponse(responseCode = "404", description = "Событие или пользователь не найдены")
    })
    public ResponseEntity<Double> getTotalUserDebt(
            @PathVariable @Parameter(description = "ID события") Integer eventId,
            @RequestParam(required = false) @Parameter(description = "ID пользователя (по умолчанию текущий)") Integer userId) {
        // Если userId не указан, используем ID текущего пользователя (реализация в сервисе)
        Double totalDebt = settlementService.getTotalUserDebt(eventId, userId);
        return ResponseEntity.ok(totalDebt);
    }

    @GetMapping("/{settlementId}")
    @Operation(summary = "Получить взаиморасчет по ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Взаиморасчет получен"),
            @ApiResponse(responseCode = "404", description = "Взаиморасчет не найден")
    })
    public ResponseEntity<SettlementDTO> getSettlement(
            @PathVariable @Parameter(description = "ID события") Integer eventId,
            @PathVariable @Parameter(description = "ID взаиморасчета") Integer settlementId) {
        SettlementDTO settlement = settlementService.getSettlement(settlementId);
        return ResponseEntity.ok(settlement);
    }

    @PatchMapping("/{settlementId}/status")
    @Operation(summary = "Обновить статус взаиморасчета (админ)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Статус обновлен"),
            @ApiResponse(responseCode = "404", description = "Взаиморасчет не найден"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав")
    })
    public ResponseEntity<Void> updateSettlementStatus(
            @PathVariable @Parameter(description = "ID события") Integer eventId,
            @PathVariable @Parameter(description = "ID взаиморасчета") Integer settlementId,
            @RequestParam @Parameter(description = "Новый статус") SettlementStatus status) {
        settlementService.updateSettlementStatus(settlementId, status);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}