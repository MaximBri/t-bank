package com.tbank.tevent.event;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.history.ActionType;
import com.tbank.tevent.history.EventHistoryService;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.EventUserRepository;
import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.repo.ExpenseSplitRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.EventUser;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventMemberService {

    private final EventUserRepository eventUserRepository;
    private final EventRepository eventRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final EventHistoryService eventHistoryService;

    @Transactional(readOnly = true)
    public List<ParticipantResponse> getParticipants(UUID eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Ивент не найден");
        }

        return eventUserRepository.findAllParticipantsByEventId(eventId);
    }
    
    @Transactional
    public void removeParticipant(UUID eventId, UUID userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));
        
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (!event.getOwnerId().equals(currentUserId)) {
            throw new AccessDeniedException("Only owner can remove participants");
        }
        
        checkIfEventIsCompleted(event);
        
        if (event.getOwnerId().equals(userId)) {
            throw new IllegalArgumentException("Cannot remove owner from their own event");
        }
        
        // Check if user is a participant
        EventUser eventUser = eventUserRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new EntityNotFoundException("User is not a participant of this event"));
        
        // Check if user has expenses
        boolean hasExpenses = checkIfUserHasExpenses(eventId, userId);
        if (hasExpenses) {
            throw new IllegalStateException("Cannot remove participant with expenses");
        }
        
        eventUserRepository.delete(eventUser);

        eventHistoryService.log(eventId, userId, ActionType.USER_KICKED,
                "Участник исключён из события владельцем");

        // Also delete any pending invitations for this user to this event
        // This would require InvitationRepository dependency
    }
    
    private boolean checkIfUserHasExpenses(UUID eventId, UUID userId) {
        // Плательщик любого НЕ отклонённого расхода (PLANNED/PENDING/ACTIVE/
        // CONFIRMED) — не только CONFIRMED, как было: иначе участника с
        // активным неподтверждённым расходом можно было удалить.
        boolean hasExpensesAsPayer = expenseRepository
                .findAllByEventIdAndStatusInOrderByCreatedAtDesc(
                        eventId, List.of("PLANNED", "PENDING", "ACTIVE", "CONFIRMED"))
                .stream()
                .anyMatch(expense -> expense.getPayerId().equals(userId));

        if (hasExpensesAsPayer) {
            return true;
        }


        return expenseSplitRepository.existsSplitForUserInEvent(eventId, userId);
    }
    
    private void checkIfEventIsCompleted(Event event) {
        if (Boolean.TRUE.equals(event.getIsCompleted())) {
            throw new ValidationException("Cannot modify a completed event");
        }
    }
    
    @Transactional
    public void leaveEvent(UUID eventId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));
        
        checkIfEventIsCompleted(event);
        
        // Check if user is the owner
        if (event.getOwnerId().equals(currentUserId)) {
            throw new IllegalStateException("Owner cannot leave their own event. Transfer ownership first.");
        }
        
        // Check if user is a participant
        EventUser eventUser = eventUserRepository.findByEventIdAndUserId(eventId, currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("You are not a participant of this event"));
        
        // Check if user has expenses
        boolean hasExpenses = checkIfUserHasExpenses(eventId, currentUserId);
        if (hasExpenses) {
            throw new IllegalStateException("Cannot leave event because you have expenses. Settle expenses first.");
        }
        

        eventUserRepository.delete(eventUser);

        eventHistoryService.log(eventId, currentUserId, ActionType.USER_LEFT,
                "Участник покинул событие");
    }
}
