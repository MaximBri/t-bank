package com.tbank.tevent.application.controller;

import com.tbank.tevent.application.service.NotificationService;
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
 * Контроллер для управления уведомлениями.
 */
@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "Управление уведомлениями пользователя")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Получить непрочитанные уведомления текущего пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Список уведомлений получен"),
            @ApiResponse(responseCode = "401", description = "Пользователь не найден")
    })
    public ResponseEntity<List<NotificationService.NotificationDTO>> getUnreadNotifications() {
        List<NotificationService.NotificationDTO> notifications = notificationService.getUnreadNotifications();
        return ResponseEntity.ok(notifications);
    }


    @PatchMapping("/{notificationId}/read")
    @Operation(summary = "Отметить уведомление как прочитанное")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Уведомление отмечено как прочитанное"),
            @ApiResponse(responseCode = "404", description = "Уведомление не найдено"),
            @ApiResponse(responseCode = "401", description = "Пользователь не авторизован")
    })
    public ResponseEntity<Void> markAsRead(
            @PathVariable @Parameter(description = "ID уведомления") Integer notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/mark-all-read")
    @Operation(summary = "Отметить все уведомления как прочитанные")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Все уведомления отмечены как прочитанные"),
            @ApiResponse(responseCode = "401", description = "Пользователь не авторизован")
    })
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @DeleteMapping("/{notificationId}")
    @Operation(summary = "Удалить уведомление")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Уведомление удалено"),
            @ApiResponse(responseCode = "404", description = "Уведомление не найдено"),
            @ApiResponse(responseCode = "401", description = "Пользователь не авторизован")
    })
    public ResponseEntity<Void> deleteNotification(
            @PathVariable @Parameter(description = "ID уведомления") Integer notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/count")
    @Operation(summary = "Получить количество непрочитанных уведомлений")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Количество получено"),
            @ApiResponse(responseCode = "401", description = "Пользователь не авторизован")
    })
    public ResponseEntity<Integer> getUnreadCount() {
        Integer count = notificationService.getUnreadCount();
        return ResponseEntity.ok(count);
    }

    @PostMapping("/test")
    @Operation(summary = "Отправить тестовое уведомление (для разработки)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Тестовое уведомление отправлено"),
            @ApiResponse(responseCode = "401", description = "Пользователь не авторизован")
    })
    public ResponseEntity<Void> sendTestNotification(
            @RequestParam @Parameter(description = "Заголовок уведомления") String title,
            @RequestParam @Parameter(description = "Текст уведомления") String message,
            @RequestParam(defaultValue = "INFO") @Parameter(description = "Тип уведомления") String type) {
        
        // Получаем ID текущего пользователя (в реальной реализации из security context)
        // Для теста отправляем уведомление текущему пользователю
        notificationService.sendNotification(1, title, message, type);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}