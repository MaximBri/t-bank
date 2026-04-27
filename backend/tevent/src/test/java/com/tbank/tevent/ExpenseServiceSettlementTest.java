package com.tbank.tevent;

import com.tbank.tevent.expense.ExpenseService;
import com.tbank.tevent.repo.*;
import com.tbank.tevent.repo.entity.EventUser;
import com.tbank.tevent.repo.entity.Expense;
import com.tbank.tevent.repo.entity.ExpenseParticipant;
import com.tbank.tevent.repo.entity.Settlement;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceSettlementTest {

    @Mock
    private ExpenseRepository expenseRepository;
    @Mock
    private ExpenseParticipantRepository expenseParticipantRepository;
    @Mock
    private EventRepository eventRepository;
    @Mock
    private EventUserRepository eventUserRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SettlementRepository settlementRepository;

    @InjectMocks
    private ExpenseService expenseService;

    private UUID eventId;
    private UUID user1, user2, user3, user4, user5;


    private Expense expense1, expense2, expense3;

    @BeforeEach
    void setUp() {
        eventId = UUID.randomUUID();
        user1 = UUID.randomUUID();
        user2 = UUID.randomUUID();
        user3 = UUID.randomUUID();
        user4 = UUID.randomUUID();
        user5 = UUID.randomUUID();


        List<EventUser> eventUsers = Arrays.asList(
                createEventUser(user1), createEventUser(user2),
                createEventUser(user3), createEventUser(user4), createEventUser(user5)
        );
        when(eventUserRepository.findAllByEventId(eventId)).thenReturn(eventUsers);

        expense1 = Expense.builder()
                .id(UUID.randomUUID()).eventId(eventId).title("Бензин")
                .amount(new BigDecimal("15000.00")).category("TRANSPORT")
                .payerId(user1).approvalStatus("CONFIRMED").build();


        expense2 = Expense.builder()
                .id(UUID.randomUUID()).eventId(eventId).title("Аренда")
                .amount(new BigDecimal("50000.00")).category("ACCOMMODATION")
                .payerId(user2).approvalStatus("CONFIRMED").build();


        expense3 = Expense.builder()
                .id(UUID.randomUUID()).eventId(eventId).title("Продукты")
                .amount(new BigDecimal("10000.00")).category("FOOD")
                .payerId(user3).approvalStatus("CONFIRMED").build();

        List<Expense> allExpenses = List.of(expense1, expense2, expense3);
        when(expenseRepository.findAllByEventIdOrderByCreatedAtDesc(eventId))
                .thenReturn(allExpenses);


        when(expenseParticipantRepository.findAllByExpenseId(expense1.getId()))
                .thenReturn(List.of(

                        ep(expense1.getId(), user1, "0.00"),

                        ep(expense1.getId(), user2, "3750.00"),
                        ep(expense1.getId(), user3, "3750.00"),
                        ep(expense1.getId(), user4, "3750.00"),
                        ep(expense1.getId(), user5, "3750.00")
                ));


        when(expenseParticipantRepository.findAllByExpenseId(expense2.getId()))
                .thenReturn(List.of(
                        ep(expense2.getId(), user1, "12500.00"),
                        ep(expense2.getId(), user2, "0.00"), // payer
                        ep(expense2.getId(), user3, "12500.00"),
                        ep(expense2.getId(), user4, "12500.00"),
                        ep(expense2.getId(), user5, "12500.00")
                ));


        when(expenseParticipantRepository.findAllByExpenseId(expense3.getId()))
                .thenReturn(List.of(
                        ep(expense3.getId(), user3, "0.00"),
                        ep(expense3.getId(), user4, "5000.00"),
                        ep(expense3.getId(), user5, "5000.00")
                ));
    }

    private ExpenseParticipant ep(UUID expenseId, UUID userId, String amount) {
        return ExpenseParticipant.builder()
                .id(UUID.randomUUID())
                .expenseId(expenseId)
                .userId(userId)
                .shareAmount(new BigDecimal(amount))
                .build();
    }

    @Test
    void shouldCalculateOptimalSettlements() {

        expenseService.recalculateSettlements(eventId);

        ArgumentCaptor<Settlement> captor = ArgumentCaptor.forClass(Settlement.class);
        verify(settlementRepository, atLeastOnce()).save(captor.capture());
        List<Settlement> created = captor.getAllValues();


        assertEquals(4, created.size(), "Should create minimal number of settlements");

        created.forEach(s -> {
            assertEquals(eventId, s.getEventId());
            assertEquals("PENDING", s.getStatus());
        });


        created.forEach(s ->
                assertTrue(s.getAmount().compareTo(BigDecimal.ZERO) > 0, "Amount must be positive")
        );


        created.forEach(s ->
                assertNotEquals(s.getFromUserId(), s.getToUserId(), "Cannot pay to yourself")
        );


//        BigDecimal totalSettlement = created.stream()
//                .map(Settlement::getAmount)
//                .reduce(BigDecimal.ZERO, BigDecimal::add);


        assertTrue(created.stream().anyMatch(s ->
                s.getFromUserId().equals(user4) &&
                        s.getToUserId().equals(user2) &&
                        s.getAmount().compareTo(new BigDecimal("21250.00")) == 0));


        assertTrue(created.stream().anyMatch(s ->
                s.getFromUserId().equals(user5) &&
                        s.getToUserId().equals(user2) &&
                        s.getAmount().compareTo(new BigDecimal("21250.00")) == 0));


        assertTrue(created.stream().anyMatch(s ->
                s.getFromUserId().equals(user3) &&
                        s.getToUserId().equals(user2) &&
                        s.getAmount().compareTo(new BigDecimal("3750.00")) == 0));


        assertTrue(created.stream().anyMatch(s ->
                s.getFromUserId().equals(user3) &&
                        s.getToUserId().equals(user1) &&
                        s.getAmount().compareTo(new BigDecimal("2500.00")) == 0));
    }

    private EventUser createEventUser(UUID userId) {
        EventUser eu = new EventUser();
        eu.setId(UUID.randomUUID());
        eu.setEventId(eventId);
        eu.setUserId(userId);
        return eu;
    }


}
