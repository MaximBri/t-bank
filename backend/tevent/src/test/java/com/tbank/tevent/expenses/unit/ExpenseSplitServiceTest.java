package com.tbank.tevent.expenses.unit;

import com.tbank.tevent.expenses.ExpenseSplitService;
import com.tbank.tevent.expenses.exception.ExpenseParticipantsRequiredException;
import com.tbank.tevent.notifications.NotificationService;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.repo.ExpenseSplitRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.Expense;
import com.tbank.tevent.repo.entity.ExpenseSplit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExpenseSplitServiceTest {

    @Mock
    private ExpenseSplitRepository splitRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private EventRepository eventRepository;

    private ExpenseSplitService service;

    @BeforeEach
    void setUp() {
        service = new ExpenseSplitService(splitRepository, notificationService, expenseRepository, eventRepository);
    }

    @Test
    // Проверка: пустой список участников запрещен для createEqualSplits
    void createEqualSplitsRejectsEmptyParticipants() {
        UUID expenseId = UUID.randomUUID();
        mockActiveEvent(expenseId, UUID.randomUUID());

        assertThatThrownBy(() -> service.createEqualSplits(expenseId, List.of(), BigDecimal.valueOf(100)))
                .isInstanceOf(ExpenseParticipantsRequiredException.class);
    }

    @Test
    // Проверка: доли считаются корректно и их сумма равна totalAmount - доля payer
    void createEqualSplitsCalculatesAndSavesSplits() {
        UUID expenseId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        UUID u1 = UUID.randomUUID();
        UUID u2 = UUID.randomUUID();

        mockActiveEvent(expenseId, eventId);

        service.createEqualSplits(expenseId, List.of(u1, u2), BigDecimal.valueOf(100));

        ArgumentCaptor<List<ExpenseSplit>> captor = ArgumentCaptor.forClass(List.class);
        verify(splitRepository).saveAll(captor.capture());
        List<ExpenseSplit> savedSplits = captor.getValue();

        assertThat(savedSplits).hasSize(2);
        assertThat(savedSplits).allMatch(split -> split.getExpenseId().equals(expenseId));
        assertThat(savedSplits).allMatch(split -> Boolean.FALSE.equals(split.getIsConfirmed()));

        BigDecimal totalDebtors = savedSplits.stream()
                .map(ExpenseSplit::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(totalDebtors).isEqualByComparingTo("66.67");
    }

    @Test
    // Проверка: confirm проставляет флаг подтверждения у доли
    void confirmMarksSplitAsConfirmed() {
        UUID expenseId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID splitId = UUID.randomUUID();

        mockActiveEvent(expenseId, eventId);

        ExpenseSplit split = ExpenseSplit.builder()
                .id(splitId)
                .expenseId(expenseId)
                .userId(userId)
                .amount(BigDecimal.TEN)
                .isConfirmed(false)
                .build();

        when(splitRepository.findByExpenseIdAndUserId(expenseId, userId)).thenReturn(Optional.of(split));

        service.confirm(expenseId, userId);

        verify(splitRepository).save(split);
        assertThat(split.getIsConfirmed()).isTrue();
    }

    @Test
    // Проверка: areAllSplitsConfirmed возвращает true только когда все подтверждены
    void areAllSplitsConfirmedReturnsExpectedValue() {
        UUID expenseId = UUID.randomUUID();

        when(splitRepository.findAllByExpenseId(expenseId)).thenReturn(List.of(
                ExpenseSplit.builder().id(UUID.randomUUID()).isConfirmed(true).build(),
                ExpenseSplit.builder().id(UUID.randomUUID()).isConfirmed(true).build()
        ));
        assertThat(service.areAllSplitsConfirmed(expenseId)).isTrue();

        when(splitRepository.findAllByExpenseId(expenseId)).thenReturn(List.of(
                ExpenseSplit.builder().id(UUID.randomUUID()).isConfirmed(true).build(),
                ExpenseSplit.builder().id(UUID.randomUUID()).isConfirmed(false).build()
        ));
        assertThat(service.areAllSplitsConfirmed(expenseId)).isFalse();
    }

    @Test
    // Проверка: notifyParticipantsAboutDeletion уведомляет всех кроме payer
    void notifyParticipantsAboutDeletionSkipsPayer() {
        UUID expenseId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        UUID payerId = UUID.randomUUID();
        UUID p1 = UUID.randomUUID();
        UUID p2 = UUID.randomUUID();

        Expense expense = Expense.builder()
                .id(expenseId)
                .eventId(eventId)
                .payerId(payerId)
                .title("Taxi")
                .build();

        when(splitRepository.findAllByExpenseId(expenseId)).thenReturn(List.of(
                ExpenseSplit.builder().expenseId(expenseId).userId(payerId).build(),
                ExpenseSplit.builder().expenseId(expenseId).userId(p1).build(),
                ExpenseSplit.builder().expenseId(expenseId).userId(p2).build()
        ));

        service.notifyParticipantsAboutDeletion(expense);

        verify(notificationService).createNotifications(
                List.of(p1, p2),
                eventId,
                expenseId,
                "Удаление расхода",
                "Расход 'Taxi' был удален автором."
        );
    }

    @Test
    // Проверка: deleteSplitsByExpense делегирует удаление после проверки completed flag
    void deleteSplitsByExpenseDeletesAllSplits() {
        UUID expenseId = UUID.randomUUID();
        mockActiveEvent(expenseId, UUID.randomUUID());

        service.deleteSplitsByExpense(expenseId);

        verify(splitRepository).deleteByExpenseId(expenseId);
    }

    private void mockActiveEvent(UUID expenseId, UUID eventId) {
        Expense expense = Expense.builder()
                .id(expenseId)
                .eventId(eventId)
                .build();
        Event event = Event.builder()
                .id(eventId)
                .isCompleted(false)
                .build();
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(expense));
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
    }
}
