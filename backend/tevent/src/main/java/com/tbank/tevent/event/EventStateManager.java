package com.tbank.tevent.event;

import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.repo.entity.Event;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class EventStateManager {
    private final EventRepository eventRepository;
    private final ExpenseRepository expenseRepository;

    public void defineEventState(UUID eventId) {
        Event event=eventRepository.findById(eventId).get();
        if(event.getState().equals("COMPLETED")) return;
        if (expenseRepository.existsByEventIdAndStatus(eventId, "ACTIVE")){
            event.setState("ACTIVE");
        } else {
            event.setState("PLANNED");
        }
    }
}
