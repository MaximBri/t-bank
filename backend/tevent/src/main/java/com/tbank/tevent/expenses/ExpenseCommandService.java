package com.tbank.tevent.expenses;

import com.tbank.tevent.EventBalanceRepository;
import com.tbank.tevent.history.ActionType;
import com.tbank.tevent.history.EventHistoryService;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.Expense;
import com.tbank.tevent.s3.S3Service;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseCommandService {
    private final EventRepository eventRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitService splitService;
    private final EventBalanceRepository balanceRepository;
    private final EventHistoryService historyService;
    private final ExpenseCategoryCommandService categoryCommandService;
    private final S3Service s3Service;

    public UUID create(UUID payerId, UUID eventId, CreateExpenseRequest request) {
        eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Событие не найдено"));

        if (request.participantIds() != null && request.participantIds().contains(payerId)) {
            throw new IllegalArgumentException("Плательщик не должен быть явно указан в списке участников.");
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
            s3Service.useKey(payerId, request.imageKey());
        }

        splitService.createEqualSplits(savedExpense.getId(), request.participantIds(), request.totalAmount());
        categoryCommandService.syncCategories(savedExpense.getId(), request.categories());

        balanceRepository.clearCalculatedDebts(eventId);

        String logMessage = String.format("Создан расход '%s' на сумму %s", request.title(), request.totalAmount());
        historyService.log(eventId, payerId, ActionType.EXPENSE_CREATED, logMessage);

        return savedExpense.getId();
    }

    public void update(UUID expenseId, UUID authorId, CreateExpenseRequest request) {
        Expense expense = getVerifiedExpense(expenseId, authorId);

        expense.setTitle(request.title());
        expense.setDescription(request.description());
        expense.setAmount(request.totalAmount());
        expense.setImageUrl(request.imageKey());
        expense.setStatus("PENDING");
        expense.setUpdatedAt(LocalDateTime.now());

        if (request.imageKey() != null && !request.imageKey().isBlank()) {
            s3Service.useKey(authorId, request.imageKey());
        }

        expenseRepository.save(expense);

        splitService.processEqualSplitsDelta(expense, request.participantIds(), request.totalAmount());

        categoryCommandService.deleteByExpenseId(expenseId);
        categoryCommandService.syncCategories(expenseId, request.categories());

        balanceRepository.clearCalculatedDebts(expense.getEventId());

        String logMessage = String.format("Отредактирован расход '%s'. Новая сумма: %s", request.title(), request.totalAmount());
        historyService.log(expense.getEventId(), authorId, ActionType.EXPENSE_UPDATED, logMessage);
    }

    public void delete(UUID expenseId, UUID authorId) {
        Expense expense = getVerifiedExpense(expenseId, authorId);

        splitService.notifyParticipantsAboutDeletion(expense);

        splitService.deleteSplitsByExpense(expenseId);
        categoryCommandService.deleteByExpenseId(expenseId);
        expenseRepository.delete(expense);

        balanceRepository.clearCalculatedDebts(expense.getEventId());

        String logMessage = String.format("Удален расход '%s' пользователем %s", expense.getTitle(), authorId);
        historyService.log(expense.getEventId(), authorId, ActionType.EXPENSE_DELETED, logMessage);
    }

    public void confirmSplit(UUID expenseId, UUID userId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("Расход не найден"));

        splitService.confirm(expenseId, userId);

        String confirmMessage = String.format("Пользователь подтвердил участие в расходе '%s'", expense.getTitle());
        historyService.log(expense.getEventId(), userId, ActionType.SPLIT_CONFIRMED, confirmMessage);

        if (splitService.areAllSplitsConfirmed(expenseId)) {
            expense.activate();
            expenseRepository.save(expense);

            balanceRepository.clearCalculatedDebts(expense.getEventId());

            String activeMessage = String.format("Расход '%s' успешно подтвержден всеми и активирован.", expense.getTitle());
            historyService.log(expense.getEventId(), userId, ActionType.EXPENSE_ACTIVATED, activeMessage);
        }
    }

    public void rejectExpense(UUID expenseId, UUID userId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("Расход не найден"));

        expense.reject();
        expenseRepository.save(expense);

        balanceRepository.clearCalculatedDebts(expense.getEventId());

        String rejectMessage = String.format("Расход '%s' отклонен", expense.getTitle());
        historyService.log(expense.getEventId(), userId, ActionType.EXPENSE_REJECTED, rejectMessage);
    }

    private Expense getVerifiedExpense(UUID expenseId, UUID authorId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("Расход не найден"));

        if (!expense.getPayerId().equals(authorId)) {
            throw new AccessDeniedException("У вас нет прав на модификацию этого расхода.");
        }
        return expense;
    }
}
