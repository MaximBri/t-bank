package com.tbank.tevent.notifications;

import com.tbank.tevent.repo.UserNotificationRepository;
import com.tbank.tevent.repo.entity.UserNotification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final UserNotificationRepository notificationRepository;

    /**
     * Создать пакет уведомлений для списка пользователей (Batch Insert)
     */
    @Transactional
    public void createNotifications(List<UUID> userIds, UUID eventId, UUID expenseId, String title, String message) {
        if (userIds == null || userIds.isEmpty()) return;

        List<UserNotification> notifications = userIds.stream()
                .map(userId -> UserNotification.builder()
                        .userId(userId)
                        .eventId(eventId)
                        .expenseId(expenseId)
                        .title(title)
                        .message(message)
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build())
                .toList();

        notificationRepository.saveAll(notifications);
    }

    /**
     * Отметить пачку уведомлений как прочитанные
     */
    @Transactional
    public void markAsRead(List<UUID> notificationIds) {
        if (notificationIds == null || notificationIds.isEmpty()) return;

        List<UserNotification> notifications = notificationRepository.findAllById(notificationIds);
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

    /**
     * Отметить одиночное уведомление как прочитанное
     */
    @Transactional
    public void markAsRead(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    /**
     * Получить список всех уведомлений пользователя (Read-Only Query)
     */
    @Transactional(readOnly = true)
    public NotificationListResponse getUserNotifications(UUID userId) {
        List<UserNotificationResponse> items = notificationRepository
                .findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();

        long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(userId);

        return new NotificationListResponse(items, unreadCount);
    }

    /**
     * Быстрый счетчик непрочитанных для иконки колокольчика в UI
     */
    @Transactional(readOnly = true)
    public long countUnread(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * Внутренний маппер сущности базы данных в плоский DTO Response
     */
    private UserNotificationResponse mapToResponse(UserNotification n) {
        return new UserNotificationResponse(
                n.getId(),
                n.getEventId(),
                n.getExpenseId(),
                n.getTitle(),
                n.getMessage(),
                n.getIsRead(),
                n.getCreatedAt()
        );
    }
}