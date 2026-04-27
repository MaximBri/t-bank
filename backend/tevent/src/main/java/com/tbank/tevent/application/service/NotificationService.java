package com.tbank.tevent.application.service;

import com.tbank.tevent.domain.event.DomainEvent;

import java.util.List;

/**
 * Сервис для управления уведомлениями.
 */
public interface NotificationService {

    /**
     * Отправить уведомление пользователю.
     *
     * @param userId ID пользователя
     * @param title заголовок уведомления
     * @param message текст уведомления
     * @param type тип уведомления (например, "INVITATION", "EXPENSE", "SETTLEMENT")
     */
    void sendNotification(Integer userId, String title, String message, String type);

    /**
     * Отправить уведомление нескольким пользователям.
     *
     * @param userIds список ID пользователей
     * @param title заголовок уведомления
     * @param message текст уведомления
     * @param type тип уведомления
     */
    void sendBulkNotification(List<Integer> userIds, String title, String message, String type);

    /**
     * Получить непрочитанные уведомления текущего пользователя.
     *
     * @return список уведомлений
     */
    List<NotificationDTO> getUnreadNotifications();

    /**
     * Отметить уведомление как прочитанное.
     *
     * @param notificationId ID уведомления
     */
    void markAsRead(Integer notificationId);

    /**
     * Отметить все уведомления как прочитанные.
     */
    void markAllAsRead();

    /**
     * Удалить уведомление.
     *
     * @param notificationId ID уведомления
     */
    void deleteNotification(Integer notificationId);

    /**
     * Обработать доменное событие и создать уведомления.
     *
     * @param event доменное событие
     */
    void handleDomainEvent(DomainEvent event);

    /**
     * Получить количество непрочитанных уведомлений.
     *
     * @return количество непрочитанных уведомлений
     */
    Integer getUnreadCount();

    /**
     * DTO для уведомления.
     */
    record NotificationDTO(
            Integer id,
            String title,
            String message,
            String type,
            Boolean isRead,
            String createdAt
    ) {}
}