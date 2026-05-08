package com.tbank.tevent.event;

import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.EventUserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventMemberService {

    private final EventUserRepository eventUserRepository;
    private final EventRepository eventRepository;

    @Transactional(readOnly = true)
    public List<ParticipantResponse> getParticipants(UUID eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Ивент не найден");
        }

        return eventUserRepository.findAllParticipantsByEventId(eventId);
    }
}
