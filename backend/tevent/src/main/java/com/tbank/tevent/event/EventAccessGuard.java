package com.tbank.tevent.event;

import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.EventUserRepository;
import com.tbank.tevent.repo.entity.Event;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Единая точка проверки доступа к событию: пользователь должен быть
 * владельцем ИЛИ участником. Переиспользуется в модулях, которые сами
 * не относятся к event (history, settlements), чтобы не дублировать
 * логику и не плодить дыры авторизации.
 */
@Component
@RequiredArgsConstructor
public class EventAccessGuard {

    private final EventRepository eventRepository;
    private final EventUserRepository eventUserRepository;

    /** Бросает AccessDeniedException, если userId не владелец и не участник eventId. */
    public void requireMember(UUID eventId, UUID userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AccessDeniedException("Access denied: event not found"));
        if (event.getOwnerId().equals(userId)) {
            return;
        }
        if (!eventUserRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new AccessDeniedException("Access denied: you are not a participant of this event");
        }
    }
}
