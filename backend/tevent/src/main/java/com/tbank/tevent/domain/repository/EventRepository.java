package com.tbank.tevent.domain.repository;

import com.tbank.tevent.domain.model.Event;
import com.tbank.tevent.domain.model.EventCategory;
import com.tbank.tevent.domain.model.EventStatus;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Репозиторий для работы с событиями
 */
public interface EventRepository extends BaseRepository<Event, Long> {
    
    /**
     * Поиск событий по владельцу
     * 
     * @param ownerId идентификатор владельца
     * @return список событий владельца
     */
    List<Event> findByOwnerId(Long ownerId);
    
    /**
     * Поиск событий, в которых участвует пользователь
     * 
     * @param participantId идентификатор участника
     * @return список событий участника
     */
    List<Event> findByParticipantId(Long participantId);
    
    /**
     * Поиск события по токену приглашения
     * 
     * @param inviteToken токен приглашения
     * @return событие, если найдено
     */
    Optional<Event> findByInviteToken(String inviteToken);
    
    /**
     * Поиск событий по статусу
     * 
     * @param status статус события
     * @return список событий
     */
    List<Event> findByStatus(EventStatus status);
    
    /**
     * Поиск событий по категории
     * 
     * @param category категория события
     * @return список событий
     */
    List<Event> findByCategory(EventCategory category);
    
    /**
     * Поиск событий по диапазону дат
     * 
     * @param startFrom дата начала от
     * @param startTo дата начала до
     * @return список событий
     */
    List<Event> findByStartDateBetween(Instant startFrom, Instant startTo);
    
    /**
     * Поиск событий по количеству участников
     * 
     * @param minParticipants минимальное количество участников
     * @param maxParticipants максимальное количество участников
     * @return список событий
     */
    List<Event> findByParticipantsCountBetween(Integer minParticipants, Integer maxParticipants);
    
    /**
     * Поиск событий по названию (поиск по подстроке)
     * 
     * @param title часть названия
     * @return список событий
     */
    List<Event> findByTitleContainingIgnoreCase(String title);
    
    /**
     * Поиск активных событий (текущие и будущие)
     * 
     * @param currentTime текущее время
     * @return список активных событий
     */
    List<Event> findActiveEvents(Instant currentTime);
    
    /**
     * Поиск завершенных событий
     * 
     * @param currentTime текущее время
     * @return список завершенных событий
     */
    List<Event> findCompletedEvents(Instant currentTime);
    
    /**
     * Получение количества событий пользователя
     * 
     * @param userId идентификатор пользователя
     * @return количество событий
     */
    long countByOwnerId(Long userId);
    
    /**
     * Проверка существования события с указанным названием у пользователя
     * 
     * @param ownerId идентификатор владельца
     * @param title название события
     * @return true если событие существует
     */
    boolean existsByOwnerIdAndTitle(Long ownerId, String title);
    
    /**
     * Обновление статуса события
     * 
     * @param eventId идентификатор события
     * @param status новый статус
     * @return количество обновленных записей
     */
    int updateStatus(Long eventId, EventStatus status);
    
    /**
     * Обновление токена приглашения
     * 
     * @param eventId идентификатор события
     * @param inviteToken новый токен приглашения
     * @return количество обновленных записей
     */
    int updateInviteToken(Long eventId, String inviteToken);
}