package com.tbank.tevent.invitations;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.event.EventNotFoundException;
import com.tbank.tevent.invitations.dto.InviteLinkDTO;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.EventUserRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.EventUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvitationLinkService {

    private final EventRepository eventRepository;
    private final EventUserRepository eventUserRepository;

    @Transactional(readOnly = true)
    public InviteLinkDTO getInviteLink(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        // Check if current user is the owner of the event
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        EventUser owner = eventUserRepository.findByEventIdAndUserId(eventId, currentUserId)
                .filter(eu -> "OWNER".equals(eu.getRole()))
                .orElseThrow(() -> new AccessDeniedException("Only the event owner can view invite link"));

        // If token is missing or expired, generate a new one
        if (event.getInviteToken() == null || event.getInviteTokenExpiresAt() == null ||
                event.getInviteTokenExpiresAt().isBefore(LocalDateTime.now())) {
            return regenerateInviteLink(eventId);
        }

        return buildInviteLinkDTO(event);
    }

    @Transactional
    public InviteLinkDTO regenerateInviteLink(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        EventUser owner = eventUserRepository.findByEventIdAndUserId(eventId, currentUserId)
                .filter(eu -> "OWNER".equals(eu.getRole()))
                .orElseThrow(() -> new AccessDeniedException("Only the event owner can regenerate invite link"));

        // Generate new token
        String token = generateToken();
        event.setInviteToken(token);
        event.setInviteTokenCreatedAt(LocalDateTime.now());
        event.setInviteTokenExpiresAt(LocalDateTime.now().plusDays(2));
        eventRepository.save(event);

        return buildInviteLinkDTO(event);
    }

    private InviteLinkDTO buildInviteLinkDTO(Event event) {
        String baseUrl = "http://localhost:3000/join"; // TODO: make configurable
        String fullUrl = baseUrl + "?token=" + event.getInviteToken();
        String qrCodeBase64 = generateQrCodeBase64(fullUrl); // placeholder

        return InviteLinkDTO.builder()
                .fullUrl(fullUrl)
                .token(event.getInviteToken())
                .qrCodeBase64(qrCodeBase64)
                .build();
    }

    private String generateToken() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }

    private String generateQrCodeBase64(String data) {
        // TODO: implement QR code generation using ZXing or similar library
        // For now, return null
        return null;
    }
}