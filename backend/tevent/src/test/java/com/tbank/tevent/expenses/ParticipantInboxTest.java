package com.tbank.tevent.expenses;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class ParticipantInboxTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withEnv("LC_ALL", "en_US.UTF-8")
            .withEnv("POSTGRES_INITDB_ARGS", "--lc-messages=en_US.UTF-8")
            .withReuse(true);

    @LocalServerPort
    private int port;

    private WebTestClient webTestClient;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    @BeforeEach
    void setUp() {
        this.webTestClient = WebTestClient.bindToServer()
                .baseUrl("http://localhost:" + port)
                .build();
    }

    @Test
    void shouldShowPendingExpensesInParticipantInbox() throws Exception {
        // --- 1. Регистрация Алисы (владельца события) ---
        var aliceSession = registerUser("alice_owner", "alice@test.com", "passsss123", null);

        // --- 2. Регистрация Боба (участника) ---
        var bobSession = registerUser("bob_participant", "bob@test.com", "passsss123", null);

        // --- 3. Алиса создает событие ---
        Map<String, Object> eventReq = Map.of(
                "title", "Team Dinner",
                "description", "Team dinner at restaurant",
                "startDate", java.time.LocalDateTime.now().plusDays(1).toString(),
                "endDate", java.time.LocalDateTime.now().plusDays(2).toString(),
                "categories", List.of()
        );

        String eventRespStr = webTestClient.post().uri("/events")
                .header("Cookie", aliceSession.cookie())
                .bodyValue(eventReq)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(String.class).returnResult().getResponseBody();

        UUID eventId = UUID.fromString(objectMapper.readTree(eventRespStr).get("id").asText());

        // --- 4. Алиса приглашает Боба в событие ---
        // Сначала получаем токен инвайта
        String tokenRespStr = webTestClient.get().uri("/events/" + eventId + "/token")
                .header("Cookie", aliceSession.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        String inviteToken = objectMapper.readTree(tokenRespStr).get("token").asText();

        // Регистрация Боба с токеном приглашения (это автоматически создаст заявку)
        var bobSessionWithInvite = registerUser("bob_participant_new", "bob2@test.com", "passsss123", inviteToken);

        // Алиса одобряет Боба (через инвайт)
        String inboxStr = webTestClient.get().uri("/invitations/inbox")
                .header("Cookie", aliceSession.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        JsonNode inbox = objectMapper.readTree(inboxStr);
        UUID invitationId = UUID.fromString(inbox.get(0).get("id").asText());

        webTestClient.patch().uri("/invitations/" + invitationId + "/decide")
                .header("Cookie", aliceSession.cookie())
                .bodyValue(Map.of("status", "ACCEPTED"))
                .exchange()
                .expectStatus().isNoContent();

        // --- 5. Проверка: inbox Боба пуст ---
        String participantInboxStr = webTestClient.get().uri("/expenses/participant/inbox")
                .header("Cookie", bobSessionWithInvite.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        JsonNode participantInbox = objectMapper.readTree(participantInboxStr);
        assertThat(participantInbox.get("pendingConfirmations").size()).isEqualTo(0);
        assertThat(participantInbox.get("actionRequired").size()).isEqualTo(0);
    }

    @Test
    void shouldShowExpenseInParticipantInboxAfterCreationByOwner() throws Exception {
        // --- 1. Регистрация Алисы (владельца события) ---
        var aliceSession = registerUser("alice_owner_expense", "alice_expense@test.com", "passsss123", null);

        // --- 2. Регистрация Боба (участника) ---
        var bobSession = registerUser("bob_participant_expense", "bob_expense@test.com", "passsss123", null);

        // --- 3. Алиса создает событие ---
        Map<String, Object> eventReq = Map.of(
                "title", "Team Dinner",
                "description", "Team dinner at restaurant",
                "startDate", java.time.LocalDateTime.now().plusDays(1).toString(),
                "endDate", java.time.LocalDateTime.now().plusDays(2).toString(),
                "categories", List.of()
        );

        String eventRespStr = webTestClient.post().uri("/events")
                .header("Cookie", aliceSession.cookie())
                .bodyValue(eventReq)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(String.class).returnResult().getResponseBody();

        UUID eventId = UUID.fromString(objectMapper.readTree(eventRespStr).get("id").asText());

        // --- 4. Алиса приглашает Боба в событие ---
        // Сначала получаем токен инвайта
        String tokenRespStr = webTestClient.get().uri("/events/" + eventId + "/token")
                .header("Cookie", aliceSession.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        String inviteToken = objectMapper.readTree(tokenRespStr).get("token").asText();

        // Регистрация Боба с токеном приглашения (это автоматически создаст заявку)
        var bobSessionWithInvite = registerUser("bob_participant_expense_new", "bob2_expense@test.com", "passsss123", inviteToken);

        // Алиса одобряет Боба (через инвайт)
        String inboxStr = webTestClient.get().uri("/invitations/inbox")
                .header("Cookie", aliceSession.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        JsonNode inbox = objectMapper.readTree(inboxStr);
        UUID invitationId = UUID.fromString(inbox.get(0).get("id").asText());

        webTestClient.patch().uri("/invitations/" + invitationId + "/decide")
                .header("Cookie", aliceSession.cookie())
                .bodyValue(Map.of("status", "ACCEPTED"))
                .exchange()
                .expectStatus().isNoContent();

        // --- 5. Алиса создает расход ---
        Map<String, Object> expenseReq = Map.of(
                "title", "Dinner",
                "totalAmount", 100.0,
                "participantIds", List.of(bobSessionWithInvite.userId().toString())
        );

        webTestClient.post().uri("/events/" + eventId + "/expenses")
                .header("Cookie", aliceSession.cookie())
                .bodyValue(expenseReq)
                .exchange()
                .expectStatus().isCreated();

        // --- 6. Проверка: расход отображается в inbox Боба ---
        String participantInboxStr = webTestClient.get().uri("/expenses/participant/inbox")
                .header("Cookie", bobSessionWithInvite.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        JsonNode participantInbox = objectMapper.readTree(participantInboxStr);
        assertThat(participantInbox.get("pendingConfirmations").size()).isEqualTo(1);
        assertThat(participantInbox.get("actionRequired").size()).isEqualTo(0);
    }

    @Test
    void shouldConfirmExpenseByParticipant() throws Exception {
        // --- 1. Регистрация Алисы (владельца события) ---
        var aliceSession = registerUser("alice_owner_confirm", "alice_confirm@test.com", "passsss123", null);

        // --- 2. Регистрация Боба (участника) ---
        var bobSession = registerUser("bob_participant_confirm", "bob_confirm@test.com", "passsss123", null);

        // --- 3. Алиса создает событие ---
        Map<String, Object> eventReq = Map.of(
                "title", "Team Dinner",
                "description", "Team dinner at restaurant",
                "startDate", java.time.LocalDateTime.now().plusDays(1).toString(),
                "endDate", java.time.LocalDateTime.now().plusDays(2).toString(),
                "categories", List.of()
        );

        String eventRespStr = webTestClient.post().uri("/events")
                .header("Cookie", aliceSession.cookie())
                .bodyValue(eventReq)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(String.class).returnResult().getResponseBody();

        UUID eventId = UUID.fromString(objectMapper.readTree(eventRespStr).get("id").asText());

        // --- 4. Алиса приглашает Боба в событие ---
        // Сначала получаем токен инвайта
        String tokenRespStr = webTestClient.get().uri("/events/" + eventId + "/token")
                .header("Cookie", aliceSession.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        String inviteToken = objectMapper.readTree(tokenRespStr).get("token").asText();

        // Регистрация Боба с токеном приглашения (это автоматически создаст заявку)
        var bobSessionWithInvite = registerUser("bob_participant_confirm_new", "bob2_confirm@test.com", "passsss123", inviteToken);

        // Алиса одобряет Боба (через инвайт)
        String inboxStr = webTestClient.get().uri("/invitations/inbox")
                .header("Cookie", aliceSession.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        JsonNode inbox = objectMapper.readTree(inboxStr);
        UUID invitationId = UUID.fromString(inbox.get(0).get("id").asText());

        webTestClient.patch().uri("/invitations/" + invitationId + "/decide")
                .header("Cookie", aliceSession.cookie())
                .bodyValue(Map.of("status", "ACCEPTED"))
                .exchange()
                .expectStatus().isNoContent();

        // --- 5. Алиса создает расход ---
        Map<String, Object> expenseReq = Map.of(
                "title", "Dinner",
                "totalAmount", 100.0,
                "participantIds", List.of(bobSessionWithInvite.userId().toString())
        );

        webTestClient.post().uri("/events/" + eventId + "/expenses")
                .header("Cookie", aliceSession.cookie())
                .bodyValue(expenseReq)
                .exchange()
                .expectStatus().isCreated();

        // --- 6. Боб подтверждает участие в расходе ---
        String participantInboxStr = webTestClient.get().uri("/expenses/participant/inbox")
                .header("Cookie", bobSessionWithInvite.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        JsonNode participantInbox = objectMapper.readTree(participantInboxStr);
        UUID expenseId = UUID.fromString(participantInbox.get("pendingConfirmations").get(0).get("expenseId").asText());

        webTestClient.post().uri("/expenses/participant/" + expenseId + "/confirm")
                .header("Cookie", bobSessionWithInvite.cookie())
                .exchange()
                .expectStatus().isNoContent();

        // --- 7. Проверка: inbox Боба пуст ---
        String participantInboxStrAfter = webTestClient.get().uri("/expenses/participant/inbox")
                .header("Cookie", bobSessionWithInvite.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        JsonNode participantInboxAfter = objectMapper.readTree(participantInboxStrAfter);
        assertThat(participantInboxAfter.get("pendingConfirmations").size()).isEqualTo(0);
        assertThat(participantInboxAfter.get("actionRequired").size()).isEqualTo(0);
    }

    @Test
    void shouldShowConfirmedExpensesInParticipantInbox() throws Exception {
        // --- 1. Регистрация Алисы (владельца события) ---
        var aliceSession = registerUser("alice_owner_confirmed", "alice_confirmed@test.com", "passsss123", null);

        // --- 2. Регистрация Боба (участника) ---
        var bobSession = registerUser("bob_participant_confirmed", "bob_confirmed@test.com", "passsss123", null);

        // --- 3. Алиса создает событие ---
        Map<String, Object> eventReq = Map.of(
                "title", "Team Dinner",
                "description", "Team dinner at restaurant",
                "startDate", java.time.LocalDateTime.now().plusDays(1).toString(),
                "endDate", java.time.LocalDateTime.now().plusDays(2).toString(),
                "categories", List.of()
        );

        String eventRespStr = webTestClient.post().uri("/events")
                .header("Cookie", aliceSession.cookie())
                .bodyValue(eventReq)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(String.class).returnResult().getResponseBody();

        UUID eventId = UUID.fromString(objectMapper.readTree(eventRespStr).get("id").asText());

        // --- 4. Алиса приглашает Боба в событие ---
        // Сначала получаем токен инвайта
        String tokenRespStr = webTestClient.get().uri("/events/" + eventId + "/token")
                .header("Cookie", aliceSession.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        String inviteToken = objectMapper.readTree(tokenRespStr).get("token").asText();

        // Регистрация Боба с токеном приглашения (это автоматически создаст заявку)
        var bobSessionWithInvite = registerUser("bob_participant_confirmed_new", "bob2_confirmed@test.com", "passsss123", inviteToken);

        // Алиса одобряет Боба (через инвайт)
        String inboxStr = webTestClient.get().uri("/invitations/inbox")
                .header("Cookie", aliceSession.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        JsonNode inbox = objectMapper.readTree(inboxStr);
        UUID invitationId = UUID.fromString(inbox.get(0).get("id").asText());

        webTestClient.patch().uri("/invitations/" + invitationId + "/decide")
                .header("Cookie", aliceSession.cookie())
                .bodyValue(Map.of("status", "ACCEPTED"))
                .exchange()
                .expectStatus().isNoContent();

        // --- 5. Алиса создает расход ---
        Map<String, Object> expenseReq = Map.of(
                "title", "Dinner",
                "totalAmount", 100.0,
                "participantIds", List.of(bobSessionWithInvite.userId().toString())
        );

        webTestClient.post().uri("/events/" + eventId + "/expenses")
                .header("Cookie", aliceSession.cookie())
                .bodyValue(expenseReq)
                .exchange()
                .expectStatus().isCreated();

        // --- 6. Боб подтверждает участие в расходе ---
        String participantInboxStr = webTestClient.get().uri("/expenses/participant/inbox")
                .header("Cookie", bobSessionWithInvite.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        JsonNode participantInbox = objectMapper.readTree(participantInboxStr);
        UUID expenseId = UUID.fromString(participantInbox.get("pendingConfirmations").get(0).get("expenseId").asText());

        webTestClient.post().uri("/expenses/participant/" + expenseId + "/confirm")
                .header("Cookie", bobSessionWithInvite.cookie())
                .exchange()
                .expectStatus().isNoContent();

        // --- 7. Проверка: расход отображается в confirmed у Боба ---
        String participantInboxStrAfter = webTestClient.get().uri("/expenses/participant/inbox")
                .header("Cookie", bobSessionWithInvite.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        JsonNode participantInboxAfter = objectMapper.readTree(participantInboxStrAfter);
        assertThat(participantInboxAfter.get("pendingConfirmations").size()).isEqualTo(0);
        assertThat(participantInboxAfter.get("actionRequired").size()).isEqualTo(0);
    }

    @Test
    void shouldShowFailedExpensesInParticipantInbox() throws Exception {
        // --- 1. Регистрация Алисы (владельца события) ---
        var aliceSession = registerUser("alice_owner_failed", "alice_failed@test.com", "passsss123", null);

        // --- 2. Регистрация Боба (участника) ---
        var bobSession = registerUser("bob_participant_failed", "bob_failed@test.com", "passsss123", null);

        // --- 3. Алиса создает событие ---
        Map<String, Object> eventReq = Map.of(
                "title", "Team Dinner",
                "description", "Team dinner at restaurant",
                "startDate", java.time.LocalDateTime.now().plusDays(1).toString(),
                "endDate", java.time.LocalDateTime.now().plusDays(2).toString(),
                "categories", List.of()
        );

        String eventRespStr = webTestClient.post().uri("/events")
                .header("Cookie", aliceSession.cookie())
                .bodyValue(eventReq)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(String.class).returnResult().getResponseBody();

        UUID eventId = UUID.fromString(objectMapper.readTree(eventRespStr).get("id").asText());

        // --- 4. Алиса приглашает Боба в событие ---
        // Сначала получаем токен инвайта
        String tokenRespStr = webTestClient.get().uri("/events/" + eventId + "/token")
                .header("Cookie", aliceSession.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        String inviteToken = objectMapper.readTree(tokenRespStr).get("token").asText();

        // Регистрация Боба с токеном приглашения (это автоматически создаст заявку)
        var bobSessionWithInvite = registerUser("bob_participant_failed_new", "bob2_failed@test.com", "passsss123", inviteToken);

        // Алиса одобряет Боба (через инвайт)
        String inboxStr = webTestClient.get().uri("/invitations/inbox")
                .header("Cookie", aliceSession.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        JsonNode inbox = objectMapper.readTree(inboxStr);
        UUID invitationId = UUID.fromString(inbox.get(0).get("id").asText());

        webTestClient.patch().uri("/invitations/" + invitationId + "/decide")
                .header("Cookie", aliceSession.cookie())
                .bodyValue(Map.of("status", "ACCEPTED"))
                .exchange()
                .expectStatus().isNoContent();

        // --- 5. Алиса создает расход ---
        Map<String, Object> expenseReq = Map.of(
                "title", "Dinner",
                "totalAmount", 100.0,
                "participantIds", List.of(bobSessionWithInvite.userId().toString())
        );

        webTestClient.post().uri("/events/" + eventId + "/expenses")
                .header("Cookie", aliceSession.cookie())
                .bodyValue(expenseReq)
                .exchange()
                .expectStatus().isCreated();

        // --- 6. Боб отклоняет участие в расходе ---
        String participantInboxStr = webTestClient.get().uri("/expenses/participant/inbox")
                .header("Cookie", bobSessionWithInvite.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        JsonNode participantInbox = objectMapper.readTree(participantInboxStr);
        UUID expenseId = UUID.fromString(participantInbox.get("pendingConfirmations").get(0).get("expenseId").asText());

        webTestClient.post().uri("/expenses/participant/" + expenseId + "/leave")
                .header("Cookie", bobSessionWithInvite.cookie())
                .exchange()
                .expectStatus().isNoContent();

        // --- 7. Проверка: расход отображается в failed у Боба ---
        String participantInboxStrAfter = webTestClient.get().uri("/expenses/participant/inbox")
                .header("Cookie", bobSessionWithInvite.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        JsonNode participantInboxAfter = objectMapper.readTree(participantInboxStrAfter);
        assertThat(participantInboxAfter.get("pendingConfirmations").size()).isEqualTo(0);
        assertThat(participantInboxAfter.get("actionRequired").size()).isEqualTo(0);
    }

    private TestSession registerUser(String login, String email, String password, String token) throws Exception {
        Map<String, Object> req = new HashMap<>();
        req.put("login", login);
        req.put("password", password);
        req.put("firstName", login);
        req.put("secondName", "Family");
        if (token != null) req.put("inviteToken", token);

        var result = webTestClient.post().uri("/auth/register")
                .bodyValue(req)
                .exchange()
                .expectStatus().isCreated()
                .returnResult(String.class);

        String cookie = result.getResponseHeaders().getFirst("Set-Cookie");
        if (cookie != null && cookie.contains(";")) {
            cookie = cookie.split(";")[0];
        }

        JsonNode body = objectMapper.readTree(result.getResponseBodyContent());
        UUID userId = UUID.fromString(body.get("userId").asText());

        return new TestSession(cookie, userId);
    }

    private record TestSession(String cookie, UUID userId) {}
}