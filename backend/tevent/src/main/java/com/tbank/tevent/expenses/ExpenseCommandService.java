package com.tbank.tevent.expenses;

import com.tbank.tevent.expenses.dto.CreateExpenseRequest;
import com.tbank.tevent.expenses.exception.ExpenseEventCompletedException;
import com.tbank.tevent.expenses.exception.ExpenseNotFoundException;
import com.tbank.tevent.expenses.exception.ExpensePayerInParticipantsException;
import com.tbank.tevent.history.ActionType;
import com.tbank.tevent.history.EventHistoryService;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.Expense;
import com.tbank.tevent.s3.S3Service;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ExpenseCommandService {
    private final EventRepository eventRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitService splitService;
    private final EventHistoryService historyService;
    private final ExpenseCategoryCommandService categoryCommandService;
    private final S3Service s3Service;

    public UUID create(UUID payerId, UUID eventId, CreateExpenseRequest request) {
        log.info("Creating expense, payerId={}, eventId={}", payerId, eventId);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Событие не найдено"));
        
        if (Boolean.TRUE.equals(event.getIsCompleted())) {
            throw new ExpenseEventCompletedException();
        }

        if (request.participantIds() != null && request.participantIds().contains(payerId)) {
            throw new ExpensePayerInParticipantsException();
        }

        Expense expense = Expense.builder()
                .eventId(eventId)
                .payerId(payerId)
                .amount(request.totalAmount())
                .title(request.title())
                .description(request.description())
                .imageUrl(request.imageKey())
                .status("PENDING")
                .build();

        Expense savedExpense = expenseRepository.save(expense);

        if (request.imageKey() != null && !request.imageKey().isBlank()) {
            s3Service.useKey(request.imageKey());
        }

        splitService.createEqualSplits(savedExpense.getId(), request.participantIds(), request.totalAmount());
        categoryCommandService.syncCategories(savedExpense.getId(), eventId, request.categories());

        String logMessage = String.format("Создан расход '%s' на сумму %s", request.title(), request.totalAmount());
        historyService.log(eventId, payerId, ActionType.EXPENSE_CREATED, logMessage);

        log.info("Expense created, expenseId={}", savedExpense.getId());
        return savedExpense.getId();
    }

    public void update(UUID eventId, UUID expenseId, UUID authorId, CreateExpenseRequest request) {
        log.info("Updating expense, expenseId={}, authorId={}", expenseId, authorId);
        Expense expense = getVerifiedExpense(eventId, expenseId, authorId);
        checkEventNotCompleted(expense.getEventId());

        expense.setTitle(request.title());
        expense.setDescription(request.description());
        expense.setAmount(request.totalAmount());
        expense.setImageUrl(request.imageKey());
        expense.setStatus("PENDING");
        expense.setUpdatedAt(LocalDateTime.now());

        if (request.imageKey() != null && !request.imageKey().isBlank()) {
            s3Service.useKey(request.imageKey());
        }

        expenseRepository.save(expense);

        splitService.processEqualSplitsDelta(expense, request.participantIds(), request.totalAmount());

        categoryCommandService.deleteByExpenseId(expenseId);
        categoryCommandService.syncCategories(expenseId, expense.getEventId(), request.categories());

        String logMessage = String.format("Отредактирован расход '%s'. Новая сумма: %s", request.title(), request.totalAmount());
        historyService.log(expense.getEventId(), authorId, ActionType.EXPENSE_UPDATED, logMessage);
        log.info("Expense updated, expenseId={}", expenseId);
    }

    public void delete(UUID eventId, UUID expenseId, UUID authorId) {
        log.info("Deleting expense, expenseId={}, authorId={}", expenseId, authorId);
        Expense expense = getVerifiedExpense(eventId, expenseId, authorId);
        checkEventNotCompleted(expense.getEventId());

        splitService.notifyParticipantsAboutDeletion(expense);

        splitService.deleteSplitsByExpense(expenseId);
        categoryCommandService.deleteByExpenseId(expenseId);
        expenseRepository.delete(expense);

        String logMessage = String.format("Удален расход '%s' пользователем %s", expense.getTitle(), authorId);
        historyService.log(expense.getEventId(), authorId, ActionType.EXPENSE_DELETED, logMessage);
        log.info("Expense deleted, expenseId={}", expenseId);
    }

    public void confirmSplit(UUID expenseId, UUID userId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(ExpenseNotFoundException::new);
        checkEventNotCompleted(expense.getEventId());

        splitService.confirm(expenseId, userId);

        String confirmMessage = String.format("Пользователь подтвердил участие в расходе '%s'", expense.getTitle());
        historyService.log(expense.getEventId(), userId, ActionType.SPLIT_CONFIRMED, confirmMessage);

        if (splitService.areAllSplitsConfirmed(expenseId)) {
            expense.activate();
            expenseRepository.save(expense);

            String activeMessage = String.format("Расход '%s' успешно подтвержден всеми и активирован.", expense.getTitle());
            historyService.log(expense.getEventId(), userId, ActionType.EXPENSE_ACTIVATED, activeMessage);
        }
        log.info("Expense split confirmed, expenseId={}, userId={}", expenseId, userId);
    }

    public void rejectSplit(UUID expenseId, UUID userId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(ExpenseNotFoundException::new);
        checkEventNotCompleted(expense.getEventId());

        expense.reject();
        expenseRepository.save(expense);

        String rejectMessage = String.format("Расход '%s' отклонен", expense.getTitle());
        historyService.log(expense.getEventId(), userId, ActionType.EXPENSE_REJECTED, rejectMessage);
        log.info("Expense rejected, expenseId={}, userId={}", expenseId, userId);
    }

    private void checkEventNotCompleted(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));
        if (Boolean.TRUE.equals(event.getIsCompleted())) {
            throw new ExpenseEventCompletedException();
        }
    }

    private Expense getVerifiedExpense(UUID eventId, UUID expenseId, UUID authorId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(ExpenseNotFoundException::new);

        if (!expense.getEventId().equals(eventId)) {
            throw new ExpenseNotFoundException();
        }

        if (!expense.getPayerId().equals(authorId)) {
            throw new AccessDeniedException("You do not have the rights to modify this expense");
        }
        return expense;
    }
}
