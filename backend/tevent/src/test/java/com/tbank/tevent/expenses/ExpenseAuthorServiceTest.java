package com.tbank.tevent.expenses;

import com.tbank.tevent.category.CategoryRepository;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.ExpenseCategoryRepository;
import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.repo.ExpenseSplitRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.Expense;
import com.tbank.tevent.repo.entity.ExpenseSplit;
import com.tbank.tevent.repo.entity.User;
import com.tbank.tevent.s3.S3Service;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExpenseAuthorServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;
    @Mock
    private EventRepository eventRepository;
    @Mock
    private ExpenseSplitRepository splitRepository;
    @Mock
    private ExpenseCategoryRepository expenseCategoryRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private S3Service s3Service;

    private ExpenseAuthorService expenseAuthorService;
    private UUID currentUserId;

    @BeforeEach
    void setUp() {
        expenseAuthorService = new ExpenseAuthorService(
                expenseRepository,
                eventRepository,
                splitRepository,
                expenseCategoryRepository,
                categoryRepository,
                s3Service
        );
        currentUserId = UUID.randomUUID();
        User user = User.builder().id(currentUserId).login("payer").build();
        SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken(user, null));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createExpenseShouldUseImageKeyAndCreateSplits() {
        UUID eventId = UUID.randomUUID();
        UUID expenseId = UUID.randomUUID();
        UUID participantId = UUID.randomUUID();
        String imageKey = "receipts/" + currentUserId + "/check.jpg";

        Event event = Event.builder().id(eventId).ownerId(currentUserId).build();
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));

        CreateExpenseRequest request = new CreateExpenseRequest(
                "Dinner",
                "Team",
                new BigDecimal("100.00"),
                imageKey,
                null,
                List.of(participantId)
        );

        when(expenseRepository.saveAndFlush(any(Expense.class))).thenAnswer(invocation -> {
            Expense e = invocation.getArgument(0);
            e.setId(expenseId);
            return e;
        });

        UUID result = expenseAuthorService.createExpense(eventId, request);

        assertThat(result).isEqualTo(expenseId);
        verify(s3Service).useKey(currentUserId, imageKey);

        ArgumentCaptor<Expense> expenseCaptor = ArgumentCaptor.forClass(Expense.class);
        verify(expenseRepository).saveAndFlush(expenseCaptor.capture());
        assertThat(expenseCaptor.getValue().getImageUrl()).isEqualTo(imageKey);

        ArgumentCaptor<List<ExpenseSplit>> splitCaptor = ArgumentCaptor.forClass(List.class);
        verify(splitRepository).saveAll(splitCaptor.capture());
        assertThat(splitCaptor.getValue()).hasSize(1);
        assertThat(splitCaptor.getValue().get(0).getAmount()).isEqualByComparingTo("50.00");
        assertThat(splitCaptor.getValue().get(0).getUserId()).isEqualTo(participantId);
    }

    @Test
    void updateExpenseShouldUseImageKeyAndUpdateStoredValue() {
        UUID eventId = UUID.randomUUID();
        UUID expenseId = UUID.randomUUID();
        String oldImageKey = "receipts/" + currentUserId + "/old.jpg";
        String newImageKey = "receipts/" + currentUserId + "/new.jpg";

        Expense existing = Expense.builder()
                .id(expenseId)
                .eventId(eventId)
                .payerId(currentUserId)
                .amount(new BigDecimal("80.00"))
                .imageUrl(oldImageKey)
                .status("PENDING")
                .title("Old")
                .build();
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(existing));

        CreateExpenseRequest request = new CreateExpenseRequest(
                "Dinner",
                "Updated",
                new BigDecimal("120.00"),
                newImageKey,
                null,
                null
        );

        expenseAuthorService.updateExpense(eventId, expenseId, request);

        verify(s3Service).useKey(currentUserId, newImageKey);
        verify(expenseRepository).save(existing);
        assertThat(existing.getImageUrl()).isEqualTo(newImageKey);
        assertThat(existing.getAmount()).isEqualByComparingTo("120.00");
    }
}
