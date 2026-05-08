package com.tbank.tevent.invite_token;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.InviteTokenRepository;
import com.tbank.tevent.repo.entity.Event;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InviteTokenService {

    private final InviteTokenRepository inviteTokenRepository;
    private final EventRepository eventRepository;

    @Transactional(readOnly = true)
    public EventTokenResponse getTokenForEvent(UUID eventId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Ивент не найден"));

        if (!event.getOwnerId().equals(currentUserId)) {
            throw new AccessDeniedException("Только владелец может просматривать токен приглашения");
        }

        return inviteTokenRepository.findTokenByEventId(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Токен для данного ивента не сгенерирован"));
    }
}
