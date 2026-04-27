package com.tbank.tevent.application.controller;

import com.tbank.tevent.application.dto.request.CreateEventRequest;
import com.tbank.tevent.application.dto.request.EventFilterRequest;
import com.tbank.tevent.application.dto.request.UpdateEventRequest;
import com.tbank.tevent.application.dto.response.EventHeaderDTO;
import com.tbank.tevent.application.dto.response.EventResponse;
import com.tbank.tevent.application.dto.response.InviteLinkDTO;
import com.tbank.tevent.application.dto.response.LeaveCheckResponse;
import com.tbank.tevent.application.dto.response.UserEventDTO;
import com.tbank.tevent.application.service.EventService;
import com.tbank.tevent.domain.model.EventCategory;
import com.tbank.tevent.shared.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Контроллер для управления событиями
 */
@RestController
@RequestMapping("/api/v1/events")
@Validated
public class EventController {
    
    private final EventService eventService;
    
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }
    
    /**
     * Создание нового события
     * 
     * @param request данные для создания события
     * @return созданное событие
     */
    @PostMapping
    public ResponseEntity<EventResponse> createEvent(@RequestBody @Valid CreateEventRequest request) {
        EventResponse response = eventService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Получение события по ID
     * 
     * @param eventId идентификатор события
     * @return событие
     */
    @GetMapping("/{eventId}")
    public ResponseEntity<EventResponse> getEvent(@PathVariable Long eventId) {
        EventResponse response = eventService.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Событие не найдено с ID: " + eventId));
        return ResponseEntity.ok(response);
    }
    
    /**
     * Обновление события
     * 
     * @param eventId идентификатор события
     * @param request данные для обновления
     * @return обновленное событие
     */
    @PutMapping("/{eventId}")
    public ResponseEntity<EventResponse> updateEvent(
            @PathVariable Long eventId,
            @RequestBody @Valid UpdateEventRequest request) {
        
        if (request.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        EventResponse response = eventService.updateEvent(eventId, request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Удаление события
     * 
     * @param eventId идентификатор события
     */
    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long eventId) {
        eventService.delete(eventId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Получение событий текущего пользователя
     * 
     * @param minParticipants минимальное количество участников (опционально)
     * @param maxParticipants максимальное количество участников (опционально)
     * @return список событий пользователя
     */
    @GetMapping("/user/events")
    public ResponseEntity<List<UserEventDTO>> getUserEvents(
            @RequestParam(required = false) @Min(0) Integer minParticipants,
            @RequestParam(required = false) @Min(1) Integer maxParticipants) {
        
        EventFilterRequest filter = new EventFilterRequest(minParticipants, maxParticipants);
        List<UserEventDTO> events = eventService.getUserEvents(filter);
        return ResponseEntity.ok(events);
    }
    
    /**
     * Получение заголовка события (для карточек)
     * 
     * @param eventId идентификатор события
     * @return заголовок события
     */
    @GetMapping("/{eventId}/header")
    public ResponseEntity<EventHeaderDTO> getEventHeader(@PathVariable Long eventId) {
        EventHeaderDTO header = eventService.getEventHeader(eventId);
        return ResponseEntity.ok(header);
    }
    
    /**
     * Генерация пригласительной ссылки
     * 
     * @param eventId идентификатор события
     * @return пригласительная ссылка
     */
    @PostMapping("/{eventId}/invite-link")
    public ResponseEntity<InviteLinkDTO> generateInviteLink(@PathVariable Long eventId) {
        InviteLinkDTO inviteLink = eventService.generateInviteLink(eventId);
        return ResponseEntity.ok(inviteLink);
    }
    
    /**
     * Проверка возможности покинуть событие
     * 
     * @param eventId идентификатор события
     * @return результат проверки
     */
    @GetMapping("/{eventId}/leave-check")
    public ResponseEntity<LeaveCheckResponse> checkLeavePossibility(@PathVariable Long eventId) {
        LeaveCheckResponse response = eventService.checkLeavePossibility(eventId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Выход из события
     * 
     * @param eventId идентификатор события
     */
    @PostMapping("/{eventId}/leave")
    public ResponseEntity<Void> leaveEvent(@PathVariable Long eventId) {
        eventService.leaveEvent(eventId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Поиск событий по названию
     * 
     * @param query поисковый запрос
     * @return список найденных событий
     */
    @GetMapping("/search")
    public ResponseEntity<List<EventResponse>> searchEvents(@RequestParam String query) {
        List<EventResponse> events = eventService.searchEvents(query);
        return ResponseEntity.ok(events);
    }
    
    /**
     * Получение событий по категории
     * 
     * @param category категория события
     * @return список событий
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<EventResponse>> getEventsByCategory(@PathVariable EventCategory category) {
        List<EventResponse> events = eventService.getEventsByCategory(category);
        return ResponseEntity.ok(events);
    }
    
    /**
     * Получение всех событий (для административных целей)
     */
    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        List<EventResponse> events = eventService.findAll();
        return ResponseEntity.ok(events);
    }
    
    /**
     * Проверка, является ли текущий пользователь владельцем события
     * 
     * @param eventId идентификатор события
     * @return true если пользователь владелец
     */
    @GetMapping("/{eventId}/is-owner")
    public ResponseEntity<IsOwnerResponse> checkIfUserIsOwner(@PathVariable Long eventId) {
        // В реальной реализации нужно получить ID текущего пользователя из контекста безопасности
        Long currentUserId = getCurrentUserId();
        boolean isOwner = eventService.isUserOwner(eventId, currentUserId);
        return ResponseEntity.ok(new IsOwnerResponse(isOwner));
    }
    
    /**
     * Получение количества участников события
     * 
     * @param eventId идентификатор события
     * @return количество участников
     */
    @GetMapping("/{eventId}/participant-count")
    public ResponseEntity<ParticipantCountResponse> getParticipantCount(@PathVariable Long eventId) {
        int count = eventService.getParticipantCount(eventId);
        return ResponseEntity.ok(new ParticipantCountResponse(count));
    }
    
    // Вспомогательные методы и DTO
    
    private Long getCurrentUserId() {
        // Реализация получения ID текущего пользователя из контекста безопасности
        // Временная заглушка
        return 1L;
    }
    
    public record IsOwnerResponse(boolean isOwner) {}
    
    public record ParticipantCountResponse(int count) {}
}