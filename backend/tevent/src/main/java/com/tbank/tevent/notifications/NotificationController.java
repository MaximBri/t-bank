package com.tbank.tevent.notifications;

import com.tbank.tevent.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<NotificationListResponse> getNotifications() {
        return ResponseEntity.ok(notificationService.getUserNotifications(SecurityUtils.getCurrentUserId()));
    }

    // Количество непрочитанных для значка на колокольчике
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        return ResponseEntity.ok(notificationService.countUnread(SecurityUtils.getCurrentUserId()));
    }

    // Отметить уведомление как прочитанное
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }
}
