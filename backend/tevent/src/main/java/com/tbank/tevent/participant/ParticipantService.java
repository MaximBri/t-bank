package com.tbank.tevent.participant;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.event.EventNotFoundException;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.EventUserRepository;
import com.tbank.tevent.repo.UserRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.EventUser;
import com.tbank.tevent.repo.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParticipantService {

    private final EventRepository eventRepository;
    private final EventUserRepository eventUserRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ParticipantsResponse getParticipants(UUID eventId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        boolean isParticipant = eventUserRepository.existsByEventIdAndUserId(eventId, currentUserId);
        if (!isParticipant && !event.getOwnerId().equals(currentUserId)) {
            throw new AccessDeniedException("Access denied: you are not a participant");
        }

        List<EventUser> eventUsers = eventUserRepository.findAllByEventId(eventId);

        List<ParticipantDTO> participants = eventUsers.stream()
                .map(eu -> {
                    User user = userRepository.findById(eu.getUserId())
                            .orElseThrow(() -> new RuntimeException("User not found: " + eu.getUserId()));
                    return mapToDTO(user, event.getOwnerId());
                })
                .toList();

        return new ParticipantsResponse(participants, participants.size());
    }

    private ParticipantDTO mapToDTO(User user, UUID ownerId) {
        ParticipantDTO dto = new ParticipantDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFirstName() + " " + user.getLastName());
        dto.setAvatarUrl(null);
        dto.setInitials(getInitials(user.getFirstName(), user.getLastName()));
        dto.setRole(user.getId().equals(ownerId) ? "OWNER" : "PARTICIPANT");
        dto.setStatus("ACCEPTED");
        return dto;
    }

    private String getInitials(String firstName, String lastName) {
        String first = firstName != null && !firstName.isEmpty() ? firstName.substring(0, 1).toUpperCase() : "";
        String last = lastName != null && !lastName.isEmpty() ? lastName.substring(0, 1).toUpperCase() : "";
        return first + last;
    }
}
