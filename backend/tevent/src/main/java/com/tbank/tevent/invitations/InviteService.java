package com.tbank.tevent.invitations;

import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.EventUserRepository;
import com.tbank.tevent.repo.InvitationRepository;
import com.tbank.tevent.repo.InviteTokenRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.EventInvitation;
import com.tbank.tevent.repo.entity.InviteToken;
import com.tbank.tevent.repo.entity.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class InviteService {

    private final InviteTokenRepository tokenRepository;
    private final EventRepository eventRepository;
    private final InvitationRepository invitationRepository;
    private final EventUserRepository eventUserRepository;

    @Transactional
    public void applyToken(User user, String tokenValue) {

        InviteToken inviteToken = tokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new EntityNotFoundException("Invalid invite token"));

        if (inviteToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Invite token has expired");
        }

        Event event = eventRepository.findByInviteTokenId(inviteToken.getId())
                .orElseThrow(() -> new EntityNotFoundException("Event not found for this token"));

        if (eventUserRepository.existsByEventIdAndUserId(event.getId(), user.getId())) {
            return;
        }

        boolean alreadyInvited = invitationRepository.existsByEventIdAndUserId(event.getId(), user.getId());
        if (alreadyInvited) {
            return;
        }

        EventInvitation invitation = EventInvitation.builder()
                .eventId(event.getId())
                .userId(user.getId())
                .invitedBy(event.getOwnerId())
                .status("PENDING_APPROVAL")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        invitationRepository.save(invitation);
    }
}
