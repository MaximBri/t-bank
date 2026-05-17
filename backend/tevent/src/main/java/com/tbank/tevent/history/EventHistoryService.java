package com.tbank.tevent.history;

import com.tbank.tevent.repo.UserRepository;
import com.tbank.tevent.repo.entity.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class EventHistoryService {
    private final EventHistoryRepository historyRepository;
    private final UserRepository userRepository;

    public void log(UUID eventId, UUID userId, ActionType actionType, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Пользователь не найден при попытке записи лога"));

        EventHistory logEntry = EventHistory.builder()
                .id(UUID.randomUUID())
                .eventId(eventId)
                .userId(userId)
                .firstName(user.getFirstName())
                .secondName(user.getSecondName())
                .actionType(actionType)
                .message(message)
                .createdAt(LocalDateTime.now())
                .build();

        historyRepository.save(logEntry);
    }

    @Transactional(readOnly = true)
    public List<EventHistoryResponse> getEventHistory(UUID eventId) {
        List<EventHistory> historyList = historyRepository.findAllByEventIdOrderByCreatedAtDesc(eventId);

        if (historyList.isEmpty()) {
            return Collections.emptyList();
        }


        Set<UUID> userIds = new HashSet<>();
        for (EventHistory eh : historyList) {
            userIds.add(eh.getUserId());
        }


        List<User> users = userRepository.findAllByIdIn(userIds);
        Map<UUID, String> userNamesMap = new HashMap<>();
        for (User u : users) {
            String fullName = String.format("%s %s",
                    u.getFirstName() != null ? u.getFirstName() : "",
                    u.getSecondName() != null ? u.getSecondName() : "").trim();
            userNamesMap.put(u.getId(), fullName.isEmpty() ? u.getLogin() : fullName);
        }


        return historyList.stream()
                .map(eh -> new EventHistoryResponse(
                        eh.getId(),
                        eh.getEventId(),
                        eh.getUserId(),
                        userNamesMap.getOrDefault(eh.getUserId(), "Неизвестный пользователь"),
                        eh.getActionType().name(),
                        eh.getMessage(),
                        eh.getCreatedAt()
                ))
                .toList();
    }
}
