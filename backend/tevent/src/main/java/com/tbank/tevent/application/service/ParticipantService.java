package com.tbank.tevent.application.service;

import com.tbank.tevent.application.dto.response.ParticipantDTO;
import com.tbank.tevent.application.dto.response.PendingInvitationResponse;
import com.tbank.tevent.domain.model.InvitationStatus;
import com.tbank.tevent.domain.model.ParticipantRole;
import com.tbank.tevent.domain.model.ParticipantStatus;

import java.util.List;

/**
 * Сервис для управления участниками событий.
 */
public interface ParticipantService {

    /**
     * Получить список участников события.
     *
     * @param eventId ID события
     * @return список DTO участников
     */
    List<ParticipantDTO> getEventParticipants(Integer eventId);

    /**
     * Пригласить пользователя в событие.
     *
     * @param eventId ID события
     * @param userId ID пользователя для приглашения
     * @param role роль участника (по умолчанию PARTICIPANT)
     */
    void inviteParticipant(Integer eventId, Integer userId, ParticipantRole role);

    /**
     * Удалить участника из события.
     *
     * @param eventId ID события
     * @param participantId ID участника
     */
    void removeParticipant(Integer eventId, Integer participantId);

    /**
     * Изменить роль участника.
     *
     * @param eventId ID события
     * @param participantId ID участника
     * @param newRole новая роль
     */
    void changeParticipantRole(Integer eventId, Integer participantId, ParticipantRole newRole);

    /**
     * Принять приглашение в событие.
     *
     * @param invitationId ID приглашения
     */
    void acceptInvitation(Integer invitationId);

    /**
     * Отклонить приглашение в событие.
     *
     * @param invitationId ID приглашения
     */
    void rejectInvitation(Integer invitationId);

    /**
     * Получить список ожидающих приглашений для текущего пользователя.
     *
     * @return список ожидающих приглашений
     */
    List<PendingInvitationResponse> getPendingInvitations();

    /**
     * Обновить статус участника.
     *
     * @param eventId ID события
     * @param participantId ID участника
     * @param newStatus новый статус
     */
    void updateParticipantStatus(Integer eventId, Integer participantId, ParticipantStatus newStatus);

    /**
     * Проверить, является ли пользователь участником события.
     *
     * @param eventId ID события
     * @param userId ID пользователя
     * @return true, если пользователь является участником
     */
    boolean isUserParticipant(Integer eventId, Integer userId);

    /**
     * Проверить, является ли пользователь владельцем события.
     *
     * @param eventId ID события
     * @param userId ID пользователя
     * @return true, если пользователь является владельцем
     */
    boolean isUserOwner(Integer eventId, Integer userId);
}