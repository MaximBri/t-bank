package com.tbank.tevent.history;

import com.tbank.tevent.event.EventAccessGuard;
import com.tbank.tevent.repo.UserRepository;
import com.tbank.tevent.repo.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class EventHistoryService {
    private final EventHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final EventAccessGuard eventAccessGuard;

    public void log(UUID eventId, UUID userId, ActionType actionType, String message) {
        // Запись истории не должна ронять основную транзакцию (создание расхода,
        // платёж и т.п.), если пользователь почему-то не найден — логируем мягко.
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("Skip history log: user {} not found, action={}, event={}", userId, actionType, eventId);
            return;
        }

        EventHistory logEntry = EventHistory.builder()
                .id(UUID.randomUUID())
                .eventId(eventId)
                .userId(userId)
                .firstName(user.getFirstName() != null ? user.getFirstName() : "")
                .secondName(user.getSecondName() != null ? user.getSecondName() : "")
                .actionType(actionType)
                .message(message)
                .createdAt(LocalDateTime.now())
                .build();

        historyRepository.save(logEntry);
    }

    @Transactional(readOnly = true)
    public List<EventHistoryResponse> getEventHistory(UUID eventId, UUID currentUserId) {
        eventAccessGuard.requireMember(eventId, currentUserId);

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
