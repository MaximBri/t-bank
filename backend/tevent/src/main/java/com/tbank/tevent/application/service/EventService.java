package com.tbank.tevent.application.service;

import com.tbank.tevent.application.dto.request.CreateEventRequest;
import com.tbank.tevent.application.dto.request.EventFilterRequest;
import com.tbank.tevent.application.dto.request.UpdateEventRequest;
import com.tbank.tevent.application.dto.response.EventHeaderDTO;
import com.tbank.tevent.application.dto.response.EventResponse;
import com.tbank.tevent.application.dto.response.InviteLinkDTO;
import com.tbank.tevent.application.dto.response.LeaveCheckResponse;
import com.tbank.tevent.application.dto.response.UserEventDTO;
import com.tbank.tevent.domain.model.Event;
import com.tbank.tevent.domain.model.EventCategory;
import com.tbank.tevent.domain.model.EventStatus;

import java.util.List;
import java.util.Optional;

/**
 * Сервис для управления событиями
 */
public interface EventService {
    
    /**
     * Создание нового события
     * 
     * @param request данные для создания события
     * @return созданное событие
     */
    EventResponse create(CreateEventRequest request);
    
    /**
     * Получение события по ID
     * 
     * @param eventId идентификатор события
     * @return событие, если найдено
     */
    Optional<EventResponse> findById(Long eventId);
    
    /**
     * Получение всех событий текущего пользователя
     * 
     * @return список событий пользователя
     */
    List<EventResponse> findAll();
    
    /**
     * Получение событий пользователя с фильтрацией
     * 
     * @param filter параметры фильтрации
     * @return список событий
     */
    List<UserEventDTO> getUserEvents(EventFilterRequest filter);
    
    /**
     * Обновление события
     * 
     * @param eventId идентификатор события
     * @param request данные для обновления
     * @return обновленное событие
     */
    EventResponse updateEvent(Long eventId, UpdateEventRequest request);
    
    /**
     * Удаление события
     * 
     * @param eventId идентификатор события
     */
    void delete(Long eventId);
    
    /**
     * Получение заголовка события (для карточек)
     * 
     * @param eventId идентификатор события
     * @return заголовок события
     */
    EventHeaderDTO getEventHeader(Long eventId);
    
    /**
     * Генерация пригласительной ссылки
     * 
     * @param eventId идентификатор события
     * @return пригласительная ссылка
     */
    InviteLinkDTO generateInviteLink(Long eventId);
    
    /**
     * Проверка возможности покинуть событие
     * 
     * @param eventId идентификатор события
     * @return результат проверки
     */
    LeaveCheckResponse checkLeavePossibility(Long eventId);
    
    /**
     * Выход из события
     * 
     * @param eventId идентификатор события
     */
    void leaveEvent(Long eventId);
    
    /**
     * Расчет статуса события на основе дат
     * 
     * @param event событие
     * @return рассчитанный статус
     */
    EventStatus calculateEventStatus(Event event);
    
    /**
     * Получение событий по категории
     * 
     * @param category категория события
     * @return список событий
     */
    List<EventResponse> getEventsByCategory(EventCategory category);
    
    /**
     * Поиск событий по названию
     * 
     * @param query поисковый запрос
     * @return список событий
     */
    List<EventResponse> searchEvents(String query);
    
    /**
     * Архивирование завершенных событий
     */
    void archiveCompletedEvents();
    
    /**
     * Проверка, является ли пользователь владельцем события
     * 
     * @param eventId идентификатор события
     * @param userId идентификатор пользователя
     * @return true если пользователь владелец
     */
    boolean isUserOwner(Long eventId, Long userId);
    
    /**
     * Получение количества участников события
     * 
     * @param eventId идентификатор события
     * @return количество участников
     */
    int getParticipantCount(Long eventId);
}