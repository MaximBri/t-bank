package com.tbank.tevent.expenses.unit;

import com.tbank.tevent.expenses.InboxQueryService;
import com.tbank.tevent.expenses.dto.ListInboxItemDTO;
import com.tbank.tevent.expenses.exception.ExpenseSplitIntegrityException;
import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.repo.ExpenseSplitRepository;
import com.tbank.tevent.repo.entity.Expense;
import com.tbank.tevent.repo.entity.ExpenseSplit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InboxQueryServiceTest {

    @Mock
    private ExpenseSplitRepository splitRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    private InboxQueryService service;

    @BeforeEach
    void setUp() {
        service = new InboxQueryService(splitRepository, expenseRepository);
    }

    @Test
    // Проверка: если pending split нет, inbox пустой
    void returnsEmptyInboxWhenNoPendingSplits() {
        UUID userId = UUID.randomUUID();
        when(splitRepository.findAllByUserIdAndIsConfirmedFalse(userId)).thenReturn(List.of());

        ListInboxItemDTO result = service.getUserInbox(userId);

        assertThat(result.listInbox()).isEmpty();
    }

    @Test
    // Проверка: если split ссылается на отсутствующий expense, кидается integrity exception
    void throwsWhenSplitReferencesMissingExpense() {
        UUID userId = UUID.randomUUID();
        UUID expenseId = UUID.randomUUID();
        UUID splitId = UUID.randomUUID();

        ExpenseSplit split = ExpenseSplit.builder()
                .id(splitId)
                .expenseId(expenseId)
                .userId(userId)
                .amount(BigDecimal.valueOf(50))
                .isConfirmed(false)
                .build();

        when(splitRepository.findAllByUserIdAndIsConfirmedFalse(userId)).thenReturn(List.of(split));
        when(expenseRepository.findAllById(List.of(expenseId))).thenReturn(List.of());

        assertThatThrownBy(() -> service.getUserInbox(userId))
                .isInstanceOf(ExpenseSplitIntegrityException.class);
    }

    @Test
    // Проверка: pending split корректно мапится в inbox item
    void mapsPendingSplitsToInboxItems() {
        UUID userId = UUID.randomUUID();
        UUID expenseId = UUID.randomUUID();

        ExpenseSplit split = ExpenseSplit.builder()
                .id(UUID.randomUUID())
                .expenseId(expenseId)
                .userId(userId)
                .amount(BigDecimal.valueOf(50))
                .isConfirmed(false)
                .build();

        Expense expense = Expense.builder()
                .id(expenseId)
                .title("Taxi")
                .status("PENDING")
                .build();

        when(splitRepository.findAllByUserIdAndIsConfirmedFalse(userId)).thenReturn(List.of(split));
        when(expenseRepository.findAllById(List.of(expenseId))).thenReturn(List.of(expense));

        ListInboxItemDTO result = service.getUserInbox(userId);

        assertThat(result.listInbox()).hasSize(1);
        assertThat(result.listInbox().getFirst().expenseId()).isEqualTo(expenseId);
        assertThat(result.listInbox().getFirst().expenseTitle()).isEqualTo("Taxi");
        assertThat(result.listInbox().getFirst().amountToPay()).isEqualByComparingTo("50");
    }
}
