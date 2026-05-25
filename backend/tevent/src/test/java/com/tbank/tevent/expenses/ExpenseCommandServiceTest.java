package com.tbank.tevent.expenses;

import com.tbank.tevent.history.EventHistoryService;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.Expense;
import com.tbank.tevent.s3.S3Service;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
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
    private EventBalanceRepository balanceRepository;
    @Mock
    private EventHistoryService historyService;
    @Mock
    private ExpenseCategoryCommandService categoryCommandService;
    @Mock
    private S3Service s3Service;

    @InjectMocks
    private ExpenseCommandService expenseCommandService;

    @Test
    void createShouldPersistImageKeyAndUseS3Key() {
        UUID payerId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        UUID expenseId = UUID.randomUUID();
        String imageKey = "receipts/" + payerId + "/check.jpg";

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(Event.builder().id(eventId).build()));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(invocation -> {
            Expense expense = invocation.getArgument(0);
            expense.setId(expenseId);
            return expense;
        });

        CreateExpenseRequest request = new CreateExpenseRequest(
                "Dinner",
                "Team",
                new BigDecimal("100.00"),
                imageKey,
                List.of("Food"),
                List.of(UUID.randomUUID())
        );

        UUID createdId = expenseCommandService.create(payerId, eventId, request);

        assertThat(createdId).isEqualTo(expenseId);
        verify(s3Service).useKey(payerId, imageKey);

        ArgumentCaptor<Expense> expenseCaptor = ArgumentCaptor.forClass(Expense.class);
        verify(expenseRepository).save(expenseCaptor.capture());
        assertThat(expenseCaptor.getValue().getImageUrl()).isEqualTo(imageKey);
    }

    @Test
    void updateShouldPersistNewImageKeyAndUseS3Key() {
        UUID authorId = UUID.randomUUID();
        UUID expenseId = UUID.randomUUID();
        String oldKey = "receipts/" + authorId + "/old.jpg";
        String newKey = "receipts/" + authorId + "/new.jpg";

        Expense existing = Expense.builder()
                .id(expenseId)
                .eventId(UUID.randomUUID())
                .payerId(authorId)
                .title("Old")
                .description("Old")
                .amount(new BigDecimal("50.00"))
                .imageUrl(oldKey)
                .status("PENDING")
                .build();
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(existing));

        CreateExpenseRequest request = new CreateExpenseRequest(
                "Dinner",
                "Updated",
                new BigDecimal("120.00"),
                newKey,
                List.of("Food"),
                List.of(UUID.randomUUID())
        );

        expenseCommandService.update(expenseId, authorId, request);

        verify(s3Service).useKey(authorId, newKey);
        verify(expenseRepository).save(existing);
        assertThat(existing.getImageUrl()).isEqualTo(newKey);
        assertThat(existing.getAmount()).isEqualByComparingTo("120.00");
    }
}
