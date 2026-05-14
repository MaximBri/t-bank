package com.tbank.tevent.expenses;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.notifications.NotificationService;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.repo.ExpenseSplitRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.Expense;
import com.tbank.tevent.repo.entity.ExpenseSplit;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExpenseParticipantService {

    private final ExpenseSplitRepository splitRepository;
    private final ExpenseRepository expenseRepository;
    private final EventRepository eventRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public InboxResponse getInbox() {
        UUID userId = SecurityUtils.getCurrentUserId();

        List<ParticipantInboxItem> pending = splitRepository.findAllPendingSplitsWithExpense(userId).stream()
                .map(s -> {
                    Expense exp = expenseRepository.findById(s.getExpenseId())
                            .orElseThrow();

                    return new ParticipantInboxItem(
                            s.getId(),
                            exp.getId(),
                            exp.getEventId(),
                            exp.getTitle(),
                            s.getAmount(),
                            exp.getPayerId(),
                            "Ожидает подтверждения организатором",
                            exp.getCreatedAt()
                    );
                })
                .toList();


        List<AuthorInboxItem> actionRequired = expenseRepository.findAllByPayerIdAndStatus(userId, "REJECTED").stream()
                .map(e -> new AuthorInboxItem(
                        e.getId(),
                        e.getEventId(),
                        e.getTitle(),
                        e.getStatus(),
                        "Расход отклонен организатором. Проверьте данные или удалите запись."
                ))
                .toList();

        return new InboxResponse(pending, actionRequired);
    }


    @Transactional
    public void confirm(UUID expenseId) {
        UUID userId = SecurityUtils.getCurrentUserId();

        ExpenseSplit split = splitRepository.findByExpenseIdAndUserId(expenseId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Вы не являетесь участником этого расхода"));

        if (split.getIsConfirmed()) return;

        split.setIsConfirmed(true);
        splitRepository.save(split);


        checkAndAdvanceStatus(expenseId);
    }


    @Transactional
    public void leave(UUID expenseId) {
        UUID userId = SecurityUtils.getCurrentUserId();

        // Проверяем, что юзер вообще в сплите
        if (!splitRepository.existsByExpenseIdAndUserId(expenseId, userId)) {
            throw new AccessDeniedException("Вы не участвуете в этом расходе");
        }

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found"));


        expense.setStatus("REJECTED");
        expense.setUpdatedAt(LocalDateTime.now());
        expenseRepository.save(expense);

        notificationService.createNotifications(
                List.of(expense.getPayerId()),
                expense.getEventId(),
                expense.getId(),
                "Отказ от расхода",
                String.format("Участник отказался от участия в расходе '%s'. Статус изменен на REJECTED.", expense.getTitle())
        );
    }


    private void checkAndAdvanceStatus(UUID expenseId) {
        Expense expense = expenseRepository.findById(expenseId).orElseThrow();


        long unconfirmedCount = splitRepository.countByExpenseIdAndIsConfirmedFalse(expenseId);

        if (unconfirmedCount == 0) {
            Event event = eventRepository.findById(expense.getEventId()).orElseThrow();


            if (expense.getPayerId().equals(event.getOwnerId())) {
                expense.setStatus("CONFIRMED");
                eventRepository.save(event);
            } else {
                expense.setStatus("PENDING");
            }

            expense.setUpdatedAt(LocalDateTime.now());
            expenseRepository.save(expense);
        }
    }
}
