package com.tbank.tevent.event;

import com.tbank.tevent.event.EventCompletionService;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.entity.Event;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class EventCompletionScheduler {

    private final EventRepository eventRepository;
    private final EventCompletionService eventCompletionService;

    @Scheduled(fixedRate = 60000) // проверяем каждую минуту
    public void completeExpiredEvents() {
        log.debug("Checking for events to complete...");

        List<Event> expiredEvents = eventRepository.findByIsCompletedFalseAndEndDateBefore(LocalDateTime.now());

        for (Event event : expiredEvents) {
            try {
                log.info("Auto-completing event: {}", event.getId());
                eventCompletionService.completeEvent(event.getId());
                log.info("Event {} completed successfully", event.getId());
            } catch (Exception e) {
                log.error("Failed to auto-complete event {}: {}", event.getId(), e.getMessage(), e);
            }
        }
    }
}
