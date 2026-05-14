package com.tbank.tevent.invitations;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.invitations.dto.MyInvitationResponse;
import com.tbank.tevent.invitations.dto.OwnerInvitationResponse;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.EventUserRepository;
import com.tbank.tevent.repo.InvitationRepository;
import com.tbank.tevent.repo.InviteTokenRepository;
import com.tbank.tevent.repo.entity.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final EventRepository eventRepository;
    private final EventUserRepository eventUserRepository;
    private final InviteTokenRepository tokenRepository;

    @Transactional(readOnly = true)
    public List<OwnerInvitationResponse> getOwnerInbox(UUID ownerId) {
        return invitationRepository.findOwnerInbox(ownerId);
    }

    @Transactional(readOnly = true)
    public List<MyInvitationResponse> getUserOutbox(UUID userId) {
        return invitationRepository.findUserOutbox(userId);
    }

    @Transactional
    public void processDecision(UUID invitationId, String newStatus) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        EventInvitation invite = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new EntityNotFoundException("Заявка не найдена"));

        Event event = eventRepository.findById(invite.getEventId())
                .orElseThrow(() -> new EntityNotFoundException("Ивент не найден"));

        if (!event.getOwnerId().equals(currentUserId)) {
            throw new AccessDeniedException("Вы не овнер этого ивента");
        }

        if (!"PENDING".equals(invite.getStatus())) {
            throw new IllegalStateException("Решение уже принято");
        }

        invite.setStatus(newStatus);
        invite.setUpdatedAt(LocalDateTime.now());
        invitationRepository.save(invite);

        if ("ACCEPTED".equals(newStatus)) {
            EventUser eventUser=new EventUser();
            eventUser.setRole("PARTICIPANT");
            eventUser.setUserId(invite.getUserId());
            eventUser.setEventId(event.getId());
            eventUserRepository.saveAndFlush(eventUser);
        }
    }
}
