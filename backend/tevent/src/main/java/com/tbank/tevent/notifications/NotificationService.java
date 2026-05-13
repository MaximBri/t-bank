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

    @Transactional
    public void markAsRead(List<UUID> notificationIds) {
        List<UserNotification> notifications = notificationRepository.findAllById(notificationIds);
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

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

    @Transactional(readOnly = true)
    public long countUnread(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

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