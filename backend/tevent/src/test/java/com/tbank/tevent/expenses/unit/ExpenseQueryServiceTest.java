package com.tbank.tevent.expenses.unit;

import com.tbank.tevent.expenses.ExpenseCategoryQueryService;
import com.tbank.tevent.expenses.ExpenseQueryService;
import com.tbank.tevent.expenses.dto.EventExpensesResponse;
import com.tbank.tevent.repo.ExpenseParticipantView;
import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.repo.ExpenseSplitRepository;
import com.tbank.tevent.repo.entity.Expense;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExpenseQueryServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private ExpenseSplitRepository splitRepository;

    @Mock
    private ExpenseCategoryQueryService categoryQueryService;

    private ExpenseQueryService service;

    @BeforeEach
    void setUp() {
        service = new ExpenseQueryService(expenseRepository, splitRepository, categoryQueryService);
    }

    @Test
    // Проверка: пустой список расходов возвращает empty response и сумму 0
    void returnsEmptyResponseWhenNoExpenses() {
        UUID eventId = UUID.randomUUID();
        when(expenseRepository.findAllByEventIdOrderByCreatedAtDesc(eventId)).thenReturn(List.of());

        EventExpensesResponse response = service.getEventExpenses(eventId);

        assertThat(response.expenses()).isEmpty();
        assertThat(response.eventTotalSum()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    // Проверка: total считается только по ACTIVE, participants ограничены 10
    void computesActiveTotalAndLimitsParticipantsToTen() {
        UUID eventId = UUID.randomUUID();
        UUID e1 = UUID.randomUUID();
        UUID e2 = UUID.randomUUID();

        Expense active = Expense.builder()
                .id(e1)
                .eventId(eventId)
                .title("Taxi")
                .description("Airport")
                .amount(new BigDecimal("120.00"))
                .payerId(UUID.randomUUID())
                .status("ACTIVE")
                .imageUrl("img-key")
                .createdAt(LocalDateTime.now())
                .build();

        Expense pending = Expense.builder()
                .id(e2)
                .eventId(eventId)
                .title("Dinner")
                .description("Team")
                .amount(new BigDecimal("80.00"))
                .payerId(UUID.randomUUID())
                .status("PENDING")
                .createdAt(LocalDateTime.now().minusHours(1))
                .build();

        when(expenseRepository.findAllByEventIdOrderByCreatedAtDesc(eventId)).thenReturn(List.of(active, pending));
        when(categoryQueryService.loadCategoriesMap(List.of(e1, e2))).thenReturn(Map.of(
                e1, List.of("transport"),
                e2, List.of("food")
        ));

        List<ExpenseParticipantView> participants = new ArrayList<>();
        for (int i = 0; i < 11; i++) {
            UUID userId = UUID.randomUUID();
            participants.add(view(e1, userId));
        }
        participants.add(view(e2, UUID.randomUUID()));
        when(splitRepository.findAllParticipantsByExpenseIds(List.of(e1, e2))).thenReturn(participants);

        EventExpensesResponse response = service.getEventExpenses(eventId);

        assertThat(response.eventTotalSum()).isEqualByComparingTo("120.00");
        assertThat(response.expenses()).hasSize(2);

        var firstExpense = response.expenses().stream()
                .filter(item -> item.id().equals(e1))
                .findFirst()
                .orElseThrow();
        assertThat(firstExpense.firstTenParticipants()).hasSize(10);
        assertThat(firstExpense.totalParticipantsCount()).isEqualTo(11);
        assertThat(firstExpense.categories()).containsExactly("transport");
    }

    private ExpenseParticipantView view(UUID expenseId, UUID userId) {
        return new ExpenseParticipantView() {
            @Override
            public UUID getExpenseId() {
                return expenseId;
            }

            @Override
            public UUID getUserId() {
                return userId;
            }
        };
    }
}
