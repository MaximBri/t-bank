package com.tbank.tevent.settlements;

import com.tbank.tevent.TestcontainersConfiguration;
import com.tbank.tevent.auth.dto.RegisterRequest;
import com.tbank.tevent.event.dto.EventRequest;
import com.tbank.tevent.exception.ApiError;
import com.tbank.tevent.expenses.dto.CreateExpenseRequest;
import com.tbank.tevent.repo.*;
import com.tbank.tevent.repo.entity.EventUser;
import com.tbank.tevent.repo.entity.Payment;
import com.tbank.tevent.s3.S3Service;
import com.tbank.tevent.settlements.dto.EventSettlementsResponse;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.springframework.http.MediaType.APPLICATION_JSON;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class PaymentSettlementControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventUserRepository eventUserRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ExpenseSplitRepository expenseSplitRepository;

    @Autowired
    private InviteTokenRepository inviteTokenRepository;

    @Autowired
    private CategoryEventRepository categoryEventRepository;

    @Autowired
    private InvitationRepository invitationRepository;

    @MockitoBean
    private S3Service s3Service;

    private String token1;
    private String token2;
    private String token3;
    private UUID userId1;
    private UUID userId2;
    private UUID userId3;

    private record UserRegistration(String accessToken, UUID userId) {}

    @BeforeEach
    void setUp() {
        doNothing().when(s3Service).useKey(anyString());

        var reg1 = registerUserAndGetId("payment-owner-" + UUID.randomUUID(), "password123");
        token1 = reg1.accessToken;
        userId1 = reg1.userId;

        var reg2 = registerUserAndGetId("payment-participant-" + UUID.randomUUID(), "password123");
        token2 = reg2.accessToken;
        userId2 = reg2.userId;

        var reg3 = registerUserAndGetId("payment-participant2-" + UUID.randomUUID(), "password123");
        token3 = reg3.accessToken;
        userId3 = reg3.userId;
    }

    @AfterEach
    void tearDown() {
        expenseSplitRepository.deleteAll();
        expenseRepository.deleteAll();
        paymentRepository.deleteAll();
        categoryEventRepository.deleteAll();
        eventUserRepository.deleteAll();
        invitationRepository.deleteAll();
        eventRepository.deleteAll();
        inviteTokenRepository.deleteAll();
    }

    // ========================
    // Helper Methods
    // ========================

    private UserRegistration registerUserAndGetId(String login, String password) {
        var registerRequest = new RegisterRequest(login, password, "Test", "User", null);
        var registerEntity = new HttpEntity<>(registerRequest);

        ResponseEntity<com.tbank.tevent.auth.dto.RegisterResponse> registerResponse = restTemplate.exchange(
                "/auth/register", HttpMethod.POST, registerEntity,
                com.tbank.tevent.auth.dto.RegisterResponse.class);

        assertThat(registerResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        UUID userId = registerResponse.getBody().userId();

        List<String> cookies = registerResponse.getHeaders().get("Set-Cookie");
        assertThat(cookies).isNotNull();
        String accessToken = extractCookieValue(cookies, "accessToken");

        return new UserRegistration(accessToken, userId);
    }

    private String extractCookieValue(List<String> cookies, String cookieName) {
        return cookies.stream()
                .filter(c -> c.startsWith(cookieName + "="))
                .findFirst()
                .map(c -> {
                    String value = c.substring((cookieName + "=").length());
                    int semicolon = value.indexOf(';');
                    return semicolon > 0 ? value.substring(0, semicolon) : value;
                })
                .orElseThrow(() -> new AssertionError("Cookie " + cookieName + " not found"));
    }

    private HttpHeaders createAuthHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", "accessToken=" + token);
        headers.setContentType(APPLICATION_JSON);
        return headers;
    }

    private EventRequest createValidEventRequest() {
        return new EventRequest(
                "Test Event",
                "Test Description",
                LocalDateTime.now().plusDays(1),
                LocalDateTime.now().plusDays(2),
                null,
                null
        );
    }

    private UUID createEvent(String token) {
        HttpHeaders headers = createAuthHeaders(token);
        HttpEntity<EventRequest> entity = new HttpEntity<>(createValidEventRequest(), headers);

        ResponseEntity<com.tbank.tevent.event.dto.EventResponse> response = restTemplate.exchange(
                "/events", HttpMethod.POST, entity,
                com.tbank.tevent.event.dto.EventResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return response.getBody().id();
    }

    private void addParticipant(UUID eventId, UUID userId) {
        EventUser eventUser = new EventUser();
        eventUser.setEventId(eventId);
        eventUser.setUserId(userId);
        eventUser.setRole("MEMBER");
        eventUser.setJoinedAt(LocalDateTime.now());
        eventUserRepository.saveAndFlush(eventUser);
    }

    private UUID createExpense(String token, UUID eventId, List<UUID> participantIds) {
        return createExpense(token, eventId, "Test Expense", BigDecimal.valueOf(300), participantIds);
    }

    private UUID createExpense(String token, UUID eventId, String title, BigDecimal amount, List<UUID> participantIds) {
        HttpHeaders headers = createAuthHeaders(token);
        CreateExpenseRequest request = new CreateExpenseRequest(
                title,
                "Description",
                amount,
                null,
                null,
                participantIds
        );
        HttpEntity<CreateExpenseRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<UUID> response = restTemplate.exchange(
                "/events/" + eventId + "/expenses", HttpMethod.POST, entity, UUID.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return response.getBody();
    }

    private void confirmSplit(String token, UUID expenseId) {
        HttpHeaders headers = createAuthHeaders(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Void> response = restTemplate.exchange(
                "/expenses/participant/" + expenseId + "/confirm",
                HttpMethod.POST, entity, Void.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
    }

    private void completeEvent(String token, UUID eventId) {
        HttpHeaders headers = createAuthHeaders(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<com.tbank.tevent.event.dto.EventResponse> response = restTemplate.exchange(
                "/events/" + eventId + "/complete", HttpMethod.POST, entity,
                com.tbank.tevent.event.dto.EventResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    /**
     * Full setup: create event, add participants, create expense, confirm splits, complete event.
     * Returns the eventId and the list of payments created by DebtCalculator.
     */
    private TestSetup fullSetup() {
        UUID eventId = createEvent(token1);
        addParticipant(eventId, userId2);
        addParticipant(eventId, userId3);

        UUID expenseId = createExpense(token1, eventId, List.of(userId2, userId3));
        confirmSplit(token2, expenseId);
        confirmSplit(token3, expenseId);

        completeEvent(token1, eventId);

        List<Payment> payments = paymentRepository.findAllByEventId(eventId);
        return new TestSetup(eventId, payments);
    }

    private record TestSetup(UUID eventId, List<Payment> payments) {}

    // ========================
    // DebtCalculator correctness
    // ========================

    @Nested
    @DisplayName("DebtCalculator - Payment generation correctness")
    class DebtCalculatorTests {

        @Test
        @DisplayName("Should create correct payments with 3 expenses and optimize transactions")
        void shouldCreateCorrectPaymentsWithMultipleExpenses() {
            // Setup: 3 expenses with different payers to test DebtCalculator optimization
            // Expense 1: user1 pays 600, participants user2, user3
            //   singleShare = 600/3 = 200, amountToDivide = 400, baseAmount = 400/2 = 200
            //   user2 split = 200, user3 split = 200
            //   user1 net: +400, user2 net: -200, user3 net: -200
            //
            // Expense 2: user2 pays 300, participants user1, user3
            //   singleShare = 300/3 = 100, amountToDivide = 200, baseAmount = 200/2 = 100
            //   user1 split = 100, user3 split = 100
            //   user2 net: +200, user1 net: -100, user3 net: -100
            //
            // Expense 3: user3 pays 150, participants user1, user2
            //   singleShare = 150/3 = 50, amountToDivide = 100, baseAmount = 100/2 = 50
            //   user1 split = 50, user2 split = 50
            //   user3 net: +100, user1 net: -50, user2 net: -50
            //
            // Final balances:
            //   user1: +400 - 100 - 50 = +250 (creditor)
            //   user2: -200 + 200 - 50 = -50  (debtor)
            //   user3: -200 - 100 + 100 = -200 (debtor)
            //
            // DebtCalculator should optimize to 2 payments (instead of 3):
            //   user3 -> user1: 200
            //   user2 -> user1: 50

            UUID eventId = createEvent(token1);
            addParticipant(eventId, userId2);
            addParticipant(eventId, userId3);

            // Expense 1: user1 pays 600
            UUID expense1 = createExpense(token1, eventId, "Expense 1", BigDecimal.valueOf(600), List.of(userId2, userId3));
            confirmSplit(token2, expense1);
            confirmSplit(token3, expense1);

            // Expense 2: user2 pays 300
            UUID expense2 = createExpense(token2, eventId, "Expense 2", BigDecimal.valueOf(300), List.of(userId1, userId3));
            confirmSplit(token1, expense2);
            confirmSplit(token3, expense2);

            // Expense 3: user3 pays 150
            UUID expense3 = createExpense(token3, eventId, "Expense 3", BigDecimal.valueOf(150), List.of(userId1, userId2));
            confirmSplit(token1, expense3);
            confirmSplit(token2, expense3);

            completeEvent(token1, eventId);

            List<Payment> payments = paymentRepository.findAllByEventId(eventId);

            // DebtCalculator should optimize: 2 payments instead of 3 raw debts
            assertThat(payments).hasSize(2);

            // Payment 1: user3 (debtor) -> user1 (creditor): 200
            Payment payment1 = payments.stream()
                    .filter(p -> p.getFromUserId().equals(userId3) && p.getToUserId().equals(userId1))
                    .findFirst()
                    .orElseThrow(() -> new AssertionError("Payment user3->user1 not found"));
            assertThat(payment1.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(200));
            assertThat(payment1.getStatus()).isEqualTo(PaymentStatus.ACTIVE);

            // Payment 2: user2 (debtor) -> user1 (creditor): 50
            Payment payment2 = payments.stream()
                    .filter(p -> p.getFromUserId().equals(userId2) && p.getToUserId().equals(userId1))
                    .findFirst()
                    .orElseThrow(() -> new AssertionError("Payment user2->user1 not found"));
            assertThat(payment2.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(50));
            assertThat(payment2.getStatus()).isEqualTo(PaymentStatus.ACTIVE);
        }
    }

    // ========================
    // POST /events/{eventId}/payments/{paymentId}/sent
    // ========================

    @Nested
    @DisplayName("POST /events/{eventId}/payments/{paymentId}/sent - Mark as Sent")
    class MarkAsSentTests {

        @Test
        @DisplayName("Should return 400 when payment not found")
        void shouldReturn400WhenPaymentNotFound() {
            TestSetup setup = fullSetup();
            UUID fakePaymentId = UUID.randomUUID();

            HttpHeaders headers = createAuthHeaders(token1);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + setup.eventId() + "/payments/" + fakePaymentId + "/sent",
                    HttpMethod.POST, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() {
            TestSetup setup = fullSetup();
            assertThat(setup.payments()).isNotEmpty();
            Payment payment = setup.payments().getFirst();

            HttpEntity<Void> entity = new HttpEntity<>(new HttpHeaders());

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + setup.eventId() + "/payments/" + payment.getId() + "/sent",
                    HttpMethod.POST, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    // ========================
    // POST /events/{eventId}/payments/{paymentId}/fail
    // ========================

    @Nested
    @DisplayName("POST /events/{eventId}/payments/{paymentId}/fail - Mark as Failed")
    class MarkAsFailedTests {

        @Test
        @DisplayName("Should return 409 when payment is not SENT")
        void shouldReturn409WhenPaymentNotSent() {
            TestSetup setup = fullSetup();
            assertThat(setup.payments()).isNotEmpty();
            Payment payment = setup.payments().getFirst();
            assertThat(payment.getStatus()).isEqualTo(PaymentStatus.ACTIVE);

            // token1 = user1 = creditor (toUserId) — correct user for fail, but status is ACTIVE not SENT
            HttpHeaders headers = createAuthHeaders(token1);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + setup.eventId() + "/payments/" + payment.getId() + "/fail",
                    HttpMethod.POST, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        }

        @Test
        @DisplayName("Should return 400 when payment not found")
        void shouldReturn400WhenPaymentNotFound() {
            TestSetup setup = fullSetup();
            UUID fakePaymentId = UUID.randomUUID();

            // token1 = user1 = creditor — correct user for fail
            HttpHeaders headers = createAuthHeaders(token1);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + setup.eventId() + "/payments/" + fakePaymentId + "/fail",
                    HttpMethod.POST, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() {
            TestSetup setup = fullSetup();
            assertThat(setup.payments()).isNotEmpty();
            Payment payment = setup.payments().getFirst();

            HttpEntity<Void> entity = new HttpEntity<>(new HttpHeaders());

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + setup.eventId() + "/payments/" + payment.getId() + "/fail",
                    HttpMethod.POST, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    // ========================
    // POST /events/{eventId}/payments/{paymentId}/complete
    // ========================

    @Nested
    @DisplayName("POST /events/{eventId}/payments/{paymentId}/complete - Mark as Complete")
    class MarkAsCompleteTests {

        @Test
        @DisplayName("Should return 409 when payment is not SENT")
        void shouldReturn409WhenPaymentNotSent() {
            TestSetup setup = fullSetup();
            assertThat(setup.payments()).isNotEmpty();
            Payment payment = setup.payments().getFirst();
            assertThat(payment.getStatus()).isEqualTo(PaymentStatus.ACTIVE);

            // token1 = user1 = creditor (toUserId) — correct user for complete, but status is ACTIVE not SENT
            HttpHeaders headers = createAuthHeaders(token1);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + setup.eventId() + "/payments/" + payment.getId() + "/complete",
                    HttpMethod.POST, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        }

        @Test
        @DisplayName("Should return 400 when payment not found")
        void shouldReturn400WhenPaymentNotFound() {
            TestSetup setup = fullSetup();
            UUID fakePaymentId = UUID.randomUUID();

            // token1 = user1 = creditor — correct user for complete
            HttpHeaders headers = createAuthHeaders(token1);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + setup.eventId() + "/payments/" + fakePaymentId + "/complete",
                    HttpMethod.POST, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() {
            TestSetup setup = fullSetup();
            assertThat(setup.payments()).isNotEmpty();
            Payment payment = setup.payments().getFirst();

            HttpEntity<Void> entity = new HttpEntity<>(new HttpHeaders());

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + setup.eventId() + "/payments/" + payment.getId() + "/complete",
                    HttpMethod.POST, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    // ========================
    // GET /events/{eventId}/settlements
    // ========================

    @Nested
    @DisplayName("GET /events/{eventId}/settlements - Get Settlements")
    class GetSettlementsTests {

        @Test
        @DisplayName("Should get settlements successfully")
        void shouldGetSettlementsSuccessfully() {
            TestSetup setup = fullSetup();
            assertThat(setup.payments()).isNotEmpty();

            HttpHeaders headers = createAuthHeaders(token1);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<EventSettlementsResponse> response = restTemplate.exchange(
                    "/events/" + setup.eventId() + "/settlements",
                    HttpMethod.GET, entity, EventSettlementsResponse.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().eventId()).isEqualTo(setup.eventId());
            assertThat(response.getBody().settlements()).isNotEmpty();
            assertThat(response.getBody().totalOutstandingDebts()).isNotNull();
        }

        @Test
        @DisplayName("Should return 400 when event is not completed")
        void shouldReturn400WhenEventNotCompleted() {
            UUID eventId = createEvent(token1);
            addParticipant(eventId, userId2);

            HttpHeaders headers = createAuthHeaders(token1);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + eventId + "/settlements",
                    HttpMethod.GET, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }

        @Test
        @DisplayName("Should return 403 when not a member")
        void shouldReturn403WhenNotMember() {
            TestSetup setup = fullSetup();

            // Register a 4th user who is not a participant
            var reg4 = registerUserAndGetId("payment-outsider-" + UUID.randomUUID(), "password123");

            HttpHeaders headers = createAuthHeaders(reg4.accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + setup.eventId() + "/settlements",
                    HttpMethod.GET, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() {
            TestSetup setup = fullSetup();

            HttpEntity<Void> entity = new HttpEntity<>(new HttpHeaders());

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + setup.eventId() + "/settlements",
                    HttpMethod.GET, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }

        @Test
        @DisplayName("Should return empty settlements when no expenses")
        void shouldReturnEmptySettlementsWhenNoExpenses() {
            UUID eventId = createEvent(token1);
            addParticipant(eventId, userId2);

            // Complete event without any expenses
            completeEvent(token1, eventId);

            HttpHeaders headers = createAuthHeaders(token1);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<EventSettlementsResponse> response = restTemplate.exchange(
                    "/events/" + eventId + "/settlements",
                    HttpMethod.GET, entity, EventSettlementsResponse.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().settlements()).isEmpty();
            assertThat(response.getBody().totalOutstandingDebts()).isEqualByComparingTo(BigDecimal.ZERO);
        }
    }
}