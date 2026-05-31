package com.tbank.tevent.expenses;

import com.fasterxml.jackson.databind.JsonNode;
import com.tbank.tevent.BaseIntegrationTest;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.ExpenseRepository;
import com.tbank.tevent.repo.ExpenseSplitRepository;
import com.tbank.tevent.repo.InviteTokenRepository;
import com.tbank.tevent.repo.UserRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.Expense;
import com.tbank.tevent.repo.entity.ExpenseSplit;
import com.tbank.tevent.repo.entity.InviteToken;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ExpenseIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InviteTokenRepository inviteTokenRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ExpenseSplitRepository expenseSplitRepository;

    @Test
    // Проверка: успешное создание расхода для указанного события
    void createExpenseReturnsCreatedAndPersistsExpense() throws Exception {
        AuthCtx payer = registerAndAuth("exp_user_");
        AuthCtx participant = registerAndAuth("exp_part_");
        Event event = createEvent(payer.userId(), false);

        String payload = expensePayload("Taxi", "Airport ride", 120, List.of(participant.userId()));

        MvcResult result = mockMvc.perform(post("/events/{eventId}/expenses", event.getId())
                        .cookie(payer.accessCookie())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andReturn();

        UUID expenseId = UUID.fromString(result.getResponse().getContentAsString().replace("\"", ""));
        Expense saved = expenseRepository.findById(expenseId).orElseThrow();

        assertThat(saved.getEventId()).isEqualTo(event.getId());
        assertThat(saved.getPayerId()).isEqualTo(payer.userId());
        assertThat(saved.getStatus()).isEqualTo("PENDING");
    }

    @Test
    // Проверка: пустой title при создании -> 400
    void createExpenseWithBlankTitleReturnsBadRequest() throws Exception {
        AuthCtx payer = registerAndAuth("exp_user_");
        AuthCtx participant = registerAndAuth("exp_part_");
        Event event = createEvent(payer.userId(), false);

        String payload = expensePayload("", "Airport ride", 120, List.of(participant.userId()));

        mockMvc.perform(post("/events/{eventId}/expenses", event.getId())
                        .cookie(payer.accessCookie())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    // Проверка: payer в participantIds при создании -> 400
    void createExpenseWithPayerInParticipantsReturnsBadRequest() throws Exception {
        AuthCtx payer = registerAndAuth("exp_user_");
        Event event = createEvent(payer.userId(), false);

        String payload = expensePayload("Taxi", "Airport ride", 120, List.of(payer.userId()));

        mockMvc.perform(post("/events/{eventId}/expenses", event.getId())
                        .cookie(payer.accessCookie())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    // Проверка: событие завершено при создании -> 409
    void createExpenseForCompletedEventReturnsConflict() throws Exception {
        AuthCtx payer = registerAndAuth("exp_user_");
        AuthCtx participant = registerAndAuth("exp_part_");
        Event completedEvent = createEvent(payer.userId(), true);

        String payload = expensePayload("Taxi", "Airport ride", 120, List.of(participant.userId()));

        mockMvc.perform(post("/events/{eventId}/expenses", completedEvent.getId())
                        .cookie(payer.accessCookie())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isConflict());
    }

    @Test
    // Проверка: update с несоответствующим eventId -> 404
    void updateWithMismatchedEventIdReturnsNotFound() throws Exception {
        AuthCtx payer = registerAndAuth("exp_user_");
        Event realEvent = createEvent(payer.userId(), false);
        Event anotherEvent = createEvent(payer.userId(), false);

        Expense expense = createExpense(realEvent.getId(), payer.userId(), "Dinner", 100, "PENDING");

        String payload = expensePayload("Dinner updated", "Team updated", 130, List.of(payer.userId()));

        mockMvc.perform(patch("/events/{eventId}/expenses/{expenseId}", anotherEvent.getId(), expense.getId())
                        .cookie(payer.accessCookie())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isNotFound());
    }

    @Test
    // Проверка: обновление не автором -> 403
    void updateByNonAuthorReturnsForbidden() throws Exception {
        AuthCtx payer = registerAndAuth("exp_user_");
        AuthCtx other = registerAndAuth("exp_other_");
        Event event = createEvent(payer.userId(), false);
        Expense expense = createExpense(event.getId(), payer.userId(), "Dinner", 100, "PENDING");

        String payload = expensePayload("Dinner updated", "Team updated", 130, List.of(other.userId()));

        mockMvc.perform(patch("/events/{eventId}/expenses/{expenseId}", event.getId(), expense.getId())
                        .cookie(other.accessCookie())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isForbidden());
    }

    @Test
    // Проверка: обновление для незавершенного события -> 409
    void updateForCompletedEventReturnsConflict() throws Exception {
        AuthCtx payer = registerAndAuth("exp_user_");
        Event completedEvent = createEvent(payer.userId(), true);
        Expense expense = createExpense(completedEvent.getId(), payer.userId(), "Dinner", 100, "PENDING");

        String payload = expensePayload("Dinner updated", "Team updated", 130, List.of(UUID.randomUUID()));

        mockMvc.perform(patch("/events/{eventId}/expenses/{expenseId}", completedEvent.getId(), expense.getId())
                        .cookie(payer.accessCookie())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isConflict());
    }

    @Test
    // Проверка: delete с несоответствующим eventId -> 404
    void deleteWithMismatchedEventIdReturnsNotFound() throws Exception {
        AuthCtx payer = registerAndAuth("exp_user_");
        Event realEvent = createEvent(payer.userId(), false);
        Event anotherEvent = createEvent(payer.userId(), false);
        Expense expense = createExpense(realEvent.getId(), payer.userId(), "Bus", 75, "PENDING");

        mockMvc.perform(delete("/events/{eventId}/expenses/{expenseId}", anotherEvent.getId(), expense.getId())
                        .cookie(payer.accessCookie()))
                .andExpect(status().isNotFound());
    }

    @Test
    // Проверка: delete не автором -> 403
    void deleteByNonAuthorReturnsForbidden() throws Exception {
        AuthCtx payer = registerAndAuth("exp_user_");
        AuthCtx other = registerAndAuth("exp_other_");
        Event event = createEvent(payer.userId(), false);
        Expense expense = createExpense(event.getId(), payer.userId(), "Bus", 75, "PENDING");

        mockMvc.perform(delete("/events/{eventId}/expenses/{expenseId}", event.getId(), expense.getId())
                        .cookie(other.accessCookie()))
                .andExpect(status().isForbidden());
    }

    @Test
    // Проверка: delete для завершенного события -> 409
    void deleteForCompletedEventReturnsConflict() throws Exception {
        AuthCtx payer = registerAndAuth("exp_user_");
        Event completedEvent = createEvent(payer.userId(), true);
        Expense expense = createExpense(completedEvent.getId(), payer.userId(), "Bus", 75, "PENDING");

        mockMvc.perform(delete("/events/{eventId}/expenses/{expenseId}", completedEvent.getId(), expense.getId())
                        .cookie(payer.accessCookie()))
                .andExpect(status().isConflict());
    }

    @Test
    // Проверка: getEventExpenses считает total только по ACTIVE расходам
    void getEventExpensesReturnsOnlyActiveInTotal() throws Exception {
        AuthCtx payer = registerAndAuth("exp_user_");
        Event event = createEvent(payer.userId(), false);
        createExpense(event.getId(), payer.userId(), "Taxi", 120, "ACTIVE");
        createExpense(event.getId(), payer.userId(), "Dinner", 80, "PENDING");

        MvcResult result = mockMvc.perform(get("/events/{eventId}/expenses", event.getId())
                        .cookie(payer.accessCookie()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.expenses").isArray())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(json.get("expenses").size()).isEqualTo(2);
        assertThat(json.get("eventTotalSum").decimalValue()).isEqualByComparingTo("120");
    }

    @Test
    // Проверка: confirm участника подтверждает split и активирует расход
    void confirmSplitMarksAsConfirmedAndActivatesExpense() throws Exception {
        AuthCtx payer = registerAndAuth("exp_user_");
        AuthCtx participant = registerAndAuth("exp_part_");
        Event event = createEvent(payer.userId(), false);
        Expense expense = createExpense(event.getId(), payer.userId(), "Taxi", 120, "PENDING");
        createSplit(expense.getId(), participant.userId(), 60, false);

        mockMvc.perform(post("/expenses/participant/{expenseId}/confirm", expense.getId())
                        .cookie(participant.accessCookie()))
                .andExpect(status().isNoContent());

        ExpenseSplit split = expenseSplitRepository.findByExpenseIdAndUserId(expense.getId(), participant.userId())
                .orElseThrow();
        Expense updatedExpense = expenseRepository.findById(expense.getId()).orElseThrow();

        assertThat(split.getIsConfirmed()).isTrue();
        assertThat(updatedExpense.getStatus()).isEqualTo("ACTIVE");
    }

    @Test
    // Проверка: confirm для завершенного события -> 409
    void confirmSplitForCompletedEventReturnsConflict() throws Exception {
        AuthCtx payer = registerAndAuth("exp_user_");
        AuthCtx participant = registerAndAuth("exp_part_");
        Event completedEvent = createEvent(payer.userId(), true);
        Expense expense = createExpense(completedEvent.getId(), payer.userId(), "Taxi", 120, "PENDING");
        createSplit(expense.getId(), participant.userId(), 60, false);

        mockMvc.perform(post("/expenses/participant/{expenseId}/confirm", expense.getId())
                        .cookie(participant.accessCookie()))
                .andExpect(status().isConflict());
    }

    @Test
    // Проверка: leave переводит расход в REJECTED
    void leaveMarksExpenseRejected() throws Exception {
        AuthCtx payer = registerAndAuth("exp_user_");
        AuthCtx participant = registerAndAuth("exp_part_");
        Event event = createEvent(payer.userId(), false);
        Expense expense = createExpense(event.getId(), payer.userId(), "Taxi", 120, "PENDING");

        mockMvc.perform(post("/expenses/participant/{expenseId}/leave", expense.getId())
                        .cookie(participant.accessCookie()))
                .andExpect(status().isNoContent());

        Expense updatedExpense = expenseRepository.findById(expense.getId()).orElseThrow();
        assertThat(updatedExpense.getStatus()).isEqualTo("REJECTED");
    }

    @Test
    // Проверка: leave для завершенного события -> 409
    void leaveForCompletedEventReturnsConflict() throws Exception {
        AuthCtx payer = registerAndAuth("exp_user_");
        AuthCtx participant = registerAndAuth("exp_part_");
        Event completedEvent = createEvent(payer.userId(), true);
        Expense expense = createExpense(completedEvent.getId(), payer.userId(), "Taxi", 120, "PENDING");

        mockMvc.perform(post("/expenses/participant/{expenseId}/leave", expense.getId())
                        .cookie(participant.accessCookie()))
                .andExpect(status().isConflict());
    }

    @Test
    // Проверка: inbox возвращает только неподтвержденные доли текущего пользователя
    void inboxReturnsOnlyPendingSplits() throws Exception {
        AuthCtx payer = registerAndAuth("exp_user_");
        AuthCtx participant = registerAndAuth("exp_part_");
        Event event = createEvent(payer.userId(), false);

        Expense pendingExpense = createExpense(event.getId(), payer.userId(), "Taxi", 120, "PENDING");
        Expense confirmedExpense = createExpense(event.getId(), payer.userId(), "Dinner", 90, "PENDING");

        createSplit(pendingExpense.getId(), participant.userId(), 60, false);
        createSplit(confirmedExpense.getId(), participant.userId(), 45, true);

        mockMvc.perform(get("/expenses/participant/inbox")
                        .cookie(participant.accessCookie()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.listInbox.length()").value(1))
                .andExpect(jsonPath("$.listInbox[0].expenseId").value(pendingExpense.getId().toString()))
                .andExpect(jsonPath("$.listInbox[0].expenseTitle").value("Taxi"));
    }

    private AuthCtx registerAndAuth(String loginPrefix) throws Exception {
        String login = loginPrefix + UUID.randomUUID().toString().substring(0, 8);
        String registerPayload = objectMapper.writeValueAsString(Map.of(
                "login", login,
                "password", "StrongPass123"
        ));

        MvcResult registerResult = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload))
                .andExpect(status().isCreated())
                .andReturn();

        Cookie accessCookie = registerResult.getResponse().getCookie("accessToken");
        UUID userId = userRepository.findByLogin(login).orElseThrow().getId();
        return new AuthCtx(accessCookie, userId);
    }

    private Event createEvent(UUID ownerId, boolean completed) {
        InviteToken inviteToken = inviteTokenRepository.saveAndFlush(InviteToken.builder()
                .token("inv_" + UUID.randomUUID())
                .expiresAt(LocalDateTime.now().plusDays(2))
                .build());

        return eventRepository.saveAndFlush(Event.builder()
                .title("Expense Test Event")
                .description("integration")
                .startDate(LocalDateTime.now().plusDays(1))
                .endDate(LocalDateTime.now().plusDays(3))
                .ownerId(ownerId)
                .inviteTokenId(inviteToken.getId())
                .isCompleted(completed)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());
    }

    private Expense createExpense(UUID eventId, UUID payerId, String title, int amount, String status) {
        return expenseRepository.saveAndFlush(Expense.builder()
                .eventId(eventId)
                .payerId(payerId)
                .amount(BigDecimal.valueOf(amount))
                .title(title)
                .description("desc")
                .status(status)
                .build());
    }

    private void createSplit(UUID expenseId, UUID userId, int amount, boolean confirmed) {
        expenseSplitRepository.saveAndFlush(ExpenseSplit.builder()
                .expenseId(expenseId)
                .userId(userId)
                .amount(BigDecimal.valueOf(amount))
                .isConfirmed(confirmed)
                .build());
    }

    private String expensePayload(String title, String description, int totalAmount, List<UUID> participantIds) throws Exception {
        return objectMapper.writeValueAsString(Map.of(
                "title", title,
                "description", description,
                "totalAmount", totalAmount,
                "participantIds", participantIds
        ));
    }

    private record AuthCtx(Cookie accessCookie, UUID userId) {
    }
}
