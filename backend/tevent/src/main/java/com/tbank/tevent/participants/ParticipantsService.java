package com.tbank.tevent.participants;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.event.EventNotFoundException;
import com.tbank.tevent.participants.dto.InviteUserRequest;
import com.tbank.tevent.participants.dto.JoinGroupRequest;
import com.tbank.tevent.participants.dto.LeaveCheckResponse;
import com.tbank.tevent.participants.dto.ParticipantDTO;
import com.tbank.tevent.participants.dto.PendingInvitationResponse;
import com.tbank.tevent.participants.dto.ResolveInvitationRequest;
import com.tbank.tevent.repo.EventInvitationRepository;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.EventUserRepository;
import com.tbank.tevent.repo.UserRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.EventInvitation;
import com.tbank.tevent.repo.entity.EventUser;
import com.tbank.tevent.repo.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParticipantsService {

    private final EventRepository eventRepository;
    private final EventUserRepository eventUserRepository;
    private final UserRepository userRepository;
    private final EventInvitationRepository eventInvitationRepository;

    @Transactional(readOnly = true)
    public List<ParticipantDTO> getParticipants(UUID eventId, String status) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));


        UUID currentUserId = SecurityUtils.getCurrentUserId();
        EventUser currentUserParticipant = eventUserRepository.findByEventIdAndUserId(eventId, currentUserId)
                .orElseThrow(() -> new AccessDeniedException("You are not a participant of this event"));

        List<EventUser> eventUsers;
        if (status != null && !status.isEmpty()) {
            eventUsers = eventUserRepository.findAllByEventIdAndStatus(eventId, status);
        } else {
            eventUsers = eventUserRepository.findAllByEventId(eventId);
        }

        return eventUsers.stream()
                .map(eventUser -> {
                    User user = userRepository.findById(eventUser.getUserId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "User not found"));
                    return mapToParticipantDTO(eventUser, user);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void inviteUser(UUID eventId, InviteUserRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        UUID currentUserId = SecurityUtils.getCurrentUserId();

        EventUser owner = eventUserRepository.findByEventIdAndUserId(eventId, currentUserId)
                .filter(eu -> "OWNER".equals(eu.getRole()))
                .orElseThrow(() -> new AccessDeniedException("Only the event owner can invite users"));


        User invitedUser = userRepository.findByLogin(request.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));


        if (eventUserRepository.findByEventIdAndUserId(eventId, invitedUser.getId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is already a participant");
        }


        if (eventInvitationRepository.existsByEventIdAndUserIdAndStatus(eventId, invitedUser.getId(), "PENDING_APPROVAL")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Invitation already pending");
        }


        EventInvitation invitation = new EventInvitation();
        invitation.setEventId(eventId);
        invitation.setUserId(invitedUser.getId());
        invitation.setInvitedBy(currentUserId);
        invitation.setStatus("PENDING_APPROVAL");
        invitation.setToken(generateToken());
        invitation.setExpiresAt(LocalDateTime.now().plusDays(2));
        eventInvitationRepository.save(invitation);
    }

    @Transactional
    public void removeParticipant(UUID eventId, UUID userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        EventUser owner = eventUserRepository.findByEventIdAndUserId(eventId, currentUserId)
                .filter(eu -> "OWNER".equals(eu.getRole()))
                .orElseThrow(() -> new AccessDeniedException("Only the event owner can remove participants"));


        if (userId.equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot remove yourself");
        }

        EventUser participant = eventUserRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Participant not found"));

        eventUserRepository.delete(participant);
    }

    @Transactional(readOnly = true)
    public LeaveCheckResponse checkLeaveAbility(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        EventUser currentUserParticipant = eventUserRepository.findByEventIdAndUserId(eventId, currentUserId)
                .orElseThrow(() -> new AccessDeniedException("You are not a participant of this event"));

        boolean isOwner = "OWNER".equals(currentUserParticipant.getRole());
        boolean hasDebts = false; // TODO: implement debt check logic
        boolean canLeave = !isOwner && !hasDebts;
        String reason = null;
        if (isOwner) {
            reason = "You are the owner of the event. Transfer ownership before leaving.";
        } else if (hasDebts) {
            reason = "You have unsettled debts in this event.";
        }

        return LeaveCheckResponse.builder()
                .canLeave(canLeave)
                .reason(reason)
                .hasDebts(hasDebts)
                .isOwner(isOwner)
                .build();
    }

    @Transactional
    public void leaveEvent(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        EventUser currentUserParticipant = eventUserRepository.findByEventIdAndUserId(eventId, currentUserId)
                .orElseThrow(() -> new AccessDeniedException("You are not a participant of this event"));

        if ("OWNER".equals(currentUserParticipant.getRole())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Owner cannot leave the event. Transfer ownership first.");
        }

        eventUserRepository.delete(currentUserParticipant);
    }

    @Transactional(readOnly = true)
    public List<PendingInvitationResponse> getPendingInvitations() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        List<EventInvitation> invitations = eventInvitationRepository.findAllByUserIdAndStatus(currentUserId, "PENDING_APPROVAL");

        return invitations.stream()
                .map(invitation -> {
                    Event event = eventRepository.findById(invitation.getEventId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Event not found"));
                    User owner = userRepository.findById(invitation.getInvitedBy())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Owner not found"));
                    return PendingInvitationResponse.builder()
                            .invitationId(invitation.getId())
                            .groupName(event.getTitle())
                            .ownerName(formatUserName(owner))
                            .status(invitation.getStatus())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void joinGroup(JoinGroupRequest request) {
        String inviteCode = request.getInviteCode();
        Event event = eventRepository.findByInviteToken(inviteCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invite code not found or expired"));


        if (event.getInviteTokenExpiresAt() != null && event.getInviteTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.GONE, "Invite link expired");
        }

        UUID currentUserId = SecurityUtils.getCurrentUserId();


        if (eventUserRepository.findByEventIdAndUserId(event.getId(), currentUserId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You are already a participant of this event");
        }


        if (eventInvitationRepository.existsByEventIdAndUserIdAndStatus(event.getId(), currentUserId, "PENDING_APPROVAL")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have a pending invitation for this event");
        }


        EventInvitation invitation = new EventInvitation();
        invitation.setEventId(event.getId());
        invitation.setUserId(currentUserId);
        invitation.setInvitedBy(event.getOwnerId());
        invitation.setStatus("PENDING_APPROVAL");
        invitation.setToken(generateToken());
        invitation.setExpiresAt(LocalDateTime.now().plusDays(2));
        eventInvitationRepository.save(invitation);
    }

    @Transactional
    public void resolveInvitation(UUID invitationId, ResolveInvitationRequest request) {
        EventInvitation invitation = eventInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (!invitation.getUserId().equals(currentUserId)) {
            throw new AccessDeniedException("You are not the recipient of this invitation");
        }

        if (!"PENDING_APPROVAL".equals(invitation.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Invitation already resolved");
        }

        if (invitation.getExpiresAt() != null && invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.GONE, "Invitation expired");
        }

        if ("ACCEPT".equals(request.getAction())) {

            EventUser eventUser = new EventUser();
            eventUser.setEventId(invitation.getEventId());
            eventUser.setUserId(invitation.getUserId());
            eventUser.setRole("PARTICIPANT");
            eventUser.setStatus("ACCEPTED");
            eventUserRepository.save(eventUser);

            invitation.setStatus("ACCEPTED");
        } else if ("DECLINE".equals(request.getAction())) {
            invitation.setStatus("DECLINED");
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid action");
        }

        invitation.setUpdatedAt(LocalDateTime.now());
        eventInvitationRepository.save(invitation);
    }

    private ParticipantDTO mapToParticipantDTO(EventUser eventUser, User user) {
        return ParticipantDTO.builder()
                .id(user.getId())
                .fullName(formatUserName(user))
                .email(user.getLogin())
                .avatarUrl(user.getAvatarUrl())
                .initials(generateInitials(user))
                .role(eventUser.getRole())
                .status(eventUser.getStatus())
                .build();
    }

    private String formatUserName(User user) {
        return (user.getFirstName() != null ? user.getFirstName() + " " : "") +
                (user.getSecondName() != null ? user.getSecondName() : "").trim();
    }

    private String generateInitials(User user) {
        String first = user.getFirstName() != null && !user.getFirstName().isEmpty() ? user.getFirstName().substring(0, 1) : "";
        String second = user.getSecondName() != null && !user.getSecondName().isEmpty() ? user.getSecondName().substring(0, 1) : "";
        return (first + second).toUpperCase();
    }

    private String generateToken() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}