package com.tbank.tevent.expenses.unit;

import com.tbank.tevent.expenses.ExpenseCategoryCommandService;
import com.tbank.tevent.expenses.ExpenseCommandService;
import com.tbank.tevent.expenses.ExpenseSplitService;
import com.tbank.tevent.expenses.dto.CreateExpenseRequest;
import com.tbank.tevent.expenses.exception.ExpenseEventCompletedException;
import com.tbank.tevent.expenses.exception.ExpenseNotFoundException;
import com.tbank.tevent.expenses.exception.ExpensePayerInParticipantsException;
import com.tbank.tevent.history.EventHistoryService;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.Expense;
import com.tbank.tevent.s3.S3Service;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExpenseCommandServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private ExpenseSplitService splitService;

    @Mock
    private EventHistoryService historyService;

    @Mock
    private ExpenseCategoryCommandService categoryCommandService;

    @Mock
    private S3Service s3Service;

    private ExpenseCommandService service;

    @BeforeEach
    void setUp() {
        service = new ExpenseCommandService(
                eventRepository,
                expenseRepository,
                splitService,
                historyService,
                categoryCommandService,
                s3Service
        );
    }

    @Test
    // Проверка: create возвращает id и запускает split/category sync для валидного запроса
    void createReturnsIdAndTriggersSplitAndCategorySync() {
        UUID payerId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        UUID expenseId = UUID.randomUUID();
        UUID participantId = UUID.randomUUID();

        Event event = Event.builder()
                .id(eventId)
                .isCompleted(false)
                .build();

        Expense savedExpense = Expense.builder()
                .id(expenseId)
                .eventId(eventId)
                .payerId(payerId)
                .amount(BigDecimal.valueOf(120))
                .title("Dinner")
                .build();

        CreateExpenseRequest request = new CreateExpenseRequest(
                "Dinner",
                "Team dinner",
                BigDecimal.valueOf(120),
                null,
                List.of(),
                List.of(participantId)
        );

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(expenseRepository.save(any(Expense.class))).thenReturn(savedExpense);

        UUID result = service.create(payerId, eventId, request);

        assertThat(result).isEqualTo(expenseId);
        verify(splitService).createEqualSplits(expenseId, List.of(participantId), BigDecimal.valueOf(120));
        verify(categoryCommandService).syncCategories(expenseId, eventId, List.of());
        verify(historyService).log(any(), any(), any(), any());
    }

    @Test
    // Проверка: create отклоняется для завершенного события
    void createRejectsWhenEventCompleted() {
        UUID payerId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();

        Event event = Event.builder()
                .id(eventId)
                .isCompleted(true)
                .build();

        CreateExpenseRequest request = new CreateExpenseRequest(
                "Dinner",
                null,
                BigDecimal.valueOf(100),
                null,
                null,
                List.of(UUID.randomUUID())
        );

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> service.create(payerId, eventId, request))
                .isInstanceOf(ExpenseEventCompletedException.class);

        verify(expenseRepository, never()).save(any());
    }

    @Test
    // Проверка: create отклоняется, если payer указан среди участников
    void createRejectsWhenPayerIsInParticipants() {
        UUID payerId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();

        Event event = Event.builder()
                .id(eventId)
                .isCompleted(false)
                .build();

        CreateExpenseRequest request = new CreateExpenseRequest(
                "Dinner",
                null,
                BigDecimal.valueOf(100),
                null,
                null,
                List.of(payerId)
        );

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> service.create(payerId, eventId, request))
                .isInstanceOf(ExpensePayerInParticipantsException.class);

        verify(expenseRepository, never()).save(any());
    }

    @Test
    // Проверка: update отклоняется, если expense не принадлежит eventId из path
    void updateRejectsWhenExpenseDoesNotBelongToEvent() {
        UUID pathEventId = UUID.randomUUID();
        UUID realEventId = UUID.randomUUID();
        UUID expenseId = UUID.randomUUID();
        UUID authorId = UUID.randomUUID();

        Expense expense = Expense.builder()
                .id(expenseId)
                .eventId(realEventId)
                .payerId(authorId)
                .status("PENDING")
                .build();

        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(expense));

        CreateExpenseRequest request = new CreateExpenseRequest(
                "Dinner",
                "Team dinner",
                BigDecimal.valueOf(120),
                null,
                List.of(),
                List.of(UUID.randomUUID())
        );

        assertThatThrownBy(() -> service.update(pathEventId, expenseId, authorId, request))
                .isInstanceOf(ExpenseNotFoundException.class);

        verify(expenseRepository, never()).save(expense);
        verifyNoInteractions(eventRepository, splitService, historyService, categoryCommandService, s3Service);
    }

    @Test
    // Проверка: update отклоняется, если текущий пользователь не автор расхода
    void updateRejectsWhenRequesterIsNotPayer() {
        UUID eventId = UUID.randomUUID();
        UUID expenseId = UUID.randomUUID();
        UUID payerId = UUID.randomUUID();
        UUID anotherUserId = UUID.randomUUID();

        Expense expense = Expense.builder()
                .id(expenseId)
                .eventId(eventId)
                .payerId(payerId)
                .status("PENDING")
                .build();

        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(expense));

        CreateExpenseRequest request = new CreateExpenseRequest(
                "Dinner",
                "Team dinner",
                BigDecimal.valueOf(120),
                null,
                List.of(),
                List.of(UUID.randomUUID())
        );

        assertThatThrownBy(() -> service.update(eventId, expenseId, anotherUserId, request))
                .isInstanceOf(AccessDeniedException.class);

        verify(expenseRepository, never()).save(expense);
        verifyNoInteractions(eventRepository, splitService, historyService, categoryCommandService, s3Service);
    }

    @Test
    // Проверка: delete отклоняется, если expense не принадлежит eventId из path
    void deleteRejectsWhenExpenseDoesNotBelongToEvent() {
        UUID pathEventId = UUID.randomUUID();
        UUID realEventId = UUID.randomUUID();
        UUID expenseId = UUID.randomUUID();
        UUID authorId = UUID.randomUUID();

        Expense expense = Expense.builder()
                .id(expenseId)
                .eventId(realEventId)
                .payerId(authorId)
                .status("PENDING")
                .build();

        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(expense));

        assertThatThrownBy(() -> service.delete(pathEventId, expenseId, authorId))
                .isInstanceOf(ExpenseNotFoundException.class);

        verify(expenseRepository, never()).delete(expense);
        verifyNoInteractions(eventRepository, splitService, historyService, categoryCommandService, s3Service);
    }

    @Test
    // Проверка: delete отклоняется, если текущий пользователь не автор расхода
    void deleteRejectsWhenRequesterIsNotPayer() {
        UUID eventId = UUID.randomUUID();
        UUID expenseId = UUID.randomUUID();
        UUID payerId = UUID.randomUUID();
        UUID anotherUserId = UUID.randomUUID();

        Expense expense = Expense.builder()
                .id(expenseId)
                .eventId(eventId)
                .payerId(payerId)
                .status("PENDING")
                .build();

        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(expense));

        assertThatThrownBy(() -> service.delete(eventId, expenseId, anotherUserId))
                .isInstanceOf(AccessDeniedException.class);

        verify(expenseRepository, never()).delete(expense);
        verifyNoInteractions(eventRepository, splitService, historyService, categoryCommandService, s3Service);
    }

    @Test
    // Проверка: confirmSplit активирует расход, если подтверждены все доли
    void confirmSplitActivatesExpenseWhenAllSplitsConfirmed() {
        UUID expenseId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Expense expense = Expense.builder()
                .id(expenseId)
                .eventId(eventId)
                .payerId(UUID.randomUUID())
                .title("Dinner")
                .status("PENDING")
                .updatedAt(LocalDateTime.now())
                .build();

        Event event = Event.builder()
                .id(eventId)
                .isCompleted(false)
                .build();

        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(expense));
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(splitService.areAllSplitsConfirmed(expenseId)).thenReturn(true);

        service.confirmSplit(expenseId, userId);

        verify(splitService).confirm(expenseId, userId);
        verify(expenseRepository).save(expense);
        assertThat(expense.getStatus()).isEqualTo("ACTIVE");
    }

    @Test
    // Проверка: rejectSplit переводит расход в REJECTED
    void rejectSplitMarksExpenseRejected() {
        UUID expenseId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Expense expense = Expense.builder()
                .id(expenseId)
                .eventId(eventId)
                .payerId(UUID.randomUUID())
                .title("Dinner")
                .status("PENDING")
                .updatedAt(LocalDateTime.now())
                .build();

        Event event = Event.builder()
                .id(eventId)
                .isCompleted(false)
                .build();

        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(expense));
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));

        service.rejectSplit(expenseId, userId);

        verify(expenseRepository).save(expense);
        assertThat(expense.getStatus()).isEqualTo("REJECTED");
    }
}
