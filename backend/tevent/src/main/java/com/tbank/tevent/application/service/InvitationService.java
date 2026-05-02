package com.tbank.tevent.application.service;

import com.tbank.tevent.application.controller.InvitationController.EventDetailsDTO;
import com.tbank.tevent.application.dto.response.InviteLinkDTO;

/**
 * Сервис для управления пригласительными ссылками.
 */
public interface InvitationService {

    /**
     * Создать пригласительную ссылку для события.
     *
     * @param eventId ID события
     * @return DTO пригласительной ссылки
     */
    InviteLinkDTO createInviteLink(Integer eventId);

    /**
     * Получить активную пригласительную ссылку для события.
     *
     * @param eventId ID события
     * @return DTO пригласительной ссылки
     */
    InviteLinkDTO getActiveInviteLink(Integer eventId);

    /**
     * Отозвать пригласительную ссылку для события.
     *
     * @param eventId ID события
     */
    void revokeInviteLink(Integer eventId);

    /**
     * Присоединиться к событию по токену приглашения.
     *
     * @param token токен приглашения
     */
    void joinByToken(String token);

    /**
     * Проверить валидность токена приглашения.
     *
     * @param token токен приглашения
     * @return true, если токен валиден
     */
    boolean validateToken(String token);

    /**
     * Получить детали события по токену приглашения.
     *
     * @param token токен приглашения
     * @return детали события
     */
    EventDetailsDTO getEventDetailsByToken(String token);

    /**
     * Генерация QR-кода для пригласительной ссылки.
     *
     * @param token токен приглашения
     * @return base64-encoded изображение QR-кода
     */
    String generateQrCode(String token);
}