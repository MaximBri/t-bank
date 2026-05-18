package com.tbank.tevent.settlements;

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
class SettlementIntegrationTest {

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
    void shouldCalculateSettlementsAndProcessPaymentFlow() throws Exception {
        // --- 1. Регистрация Алисы (владелец события) ---
        var aliceSession = registerUser("alice_settle", "alice_settle@test.com", "passsss123", null);

        // --- 2. Алиса создает событие ---
        Map<String, Object> eventReq = Map.of(
                "title", "Settlement Test Event",
                "description", "Event for testing settlements",
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

        // --- 3. Приглашаем Боба и Чарли в событие ---
        // Получаем токен инвайта
        String tokenRespStr = webTestClient.get().uri("/events/" + eventId + "/token")
                .header("Cookie", aliceSession.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        String inviteToken = objectMapper.readTree(tokenRespStr).get("token").asText();

        // Регистрация Боба с токеном
        var bobSession = registerUser("bob_settle", "bob_settle@test.com", "passsss123", inviteToken);

        // Регистрация Чарли с тем же токеном (можно повторно использовать токен)
        var charlieSession = registerUser("charlie_settle", "charlie_settle@test.com", "passsss123", inviteToken);

        // Алиса одобряет обоих
        String inboxStr = webTestClient.get().uri("/invitations/inbox")
                .header("Cookie", aliceSession.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        JsonNode inbox = objectMapper.readTree(inboxStr);
        for (JsonNode invitation : inbox) {
            UUID invitationId = UUID.fromString(invitation.get("id").asText());
            webTestClient.patch().uri("/invitations/" + invitationId + "/decide")
                    .header("Cookie", aliceSession.cookie())
                    .bodyValue(Map.of("status", "ACCEPTED"))
                    .exchange()
                    .expectStatus().isNoContent();
        }

        // --- 4. Алиса создает подтвержденный расход (она заплатила 300, Боб и Чарли должны по 150) ---
        Map<String, Object> expenseReq = Map.of(
                "title", "Dinner",
                "description", "Restaurant bill",
                "totalAmount", 300.0,
                "imageUrl", "http://example.com/bill.jpg",
                "categories", List.of(),
                "participantIds", List.of(bobSession.userId().toString(), charlieSession.userId().toString())
        );

        String expenseRespStr = webTestClient.post().uri("/events/" + eventId + "/expenses")
                .header("Cookie", aliceSession.cookie())
                .bodyValue(expenseReq)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(String.class).returnResult().getResponseBody();

        UUID expenseId = UUID.fromString(objectMapper.readTree(expenseRespStr).asText());

        // Боб и Чарли подтверждают свои доли
        webTestClient.post().uri("/expenses/participant/" + expenseId + "/confirm")
                .header("Cookie", bobSession.cookie())
                .exchange()
                .expectStatus().isNoContent();

        webTestClient.post().uri("/expenses/participant/" + expenseId + "/confirm")
                .header("Cookie", charlieSession.cookie())
                .exchange()
                .expectStatus().isNoContent();

        // --- 5. Проверяем расчет долгов (settlements) ---
        String settlementsStr = webTestClient.get().uri("/events/" + eventId + "/settlements")
                .header("Cookie", aliceSession.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        JsonNode settlementsResponse = objectMapper.readTree(settlementsStr);
        JsonNode settlements = settlementsResponse.get("settlements");
        assertThat(settlements.isArray()).isTrue();
        // Ожидаем два шага: Боб → Алиса 150, Чарли → Алиса 150
        assertThat(settlements.size()).isEqualTo(2);

        // Проверяем что каждый шаг содержит правильные суммы
        for (JsonNode step : settlements) {
            BigDecimal amount = new BigDecimal(step.get("amount").asText());
            assertThat(amount).isEqualByComparingTo("150");
            UUID debtorId = UUID.fromString(step.get("debtorId").asText());
            UUID creditorId = UUID.fromString(step.get("creditorId").asText());
            assertThat(debtorId).isIn(bobSession.userId(), charlieSession.userId());
            assertThat(creditorId).isEqualTo(aliceSession.userId());
        }

        // --- 6. Боб отправляет уже сгенерированный платеж Алисе ---
        UUID paymentId = null;
        for (JsonNode step : settlements) {
            UUID debtorId = UUID.fromString(step.get("debtorId").asText());
            if (debtorId.equals(bobSession.userId())) {
                paymentId = UUID.fromString(step.get("paymentId").asText());
                break;
            }
        }
        assertThat(paymentId).isNotNull();

        // --- 7. Боб отмечает платеж как отправленный ---
        webTestClient.post().uri("/events/" + eventId + "/payments/" + paymentId + "/sent")
                .header("Cookie", bobSession.cookie())
                .exchange()
                .expectStatus().isOk();

        // --- 8. Алиса подтверждает получение платежа ---
        webTestClient.post().uri("/events/" + eventId + "/payments/" + paymentId + "/complete")
                .header("Cookie", aliceSession.cookie())
                .exchange()
                .expectStatus().isOk();

        // --- 9. Проверяем что после завершения платежа settlements изменились ---
        String updatedSettlementsStr = webTestClient.get().uri("/events/" + eventId + "/settlements")
                .header("Cookie", aliceSession.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        JsonNode updatedSettlementsResponse = objectMapper.readTree(updatedSettlementsStr);
        JsonNode updatedSettlements = updatedSettlementsResponse.get("settlements");
        assertThat(updatedSettlements.size()).isEqualTo(1);
        JsonNode remainingStep = updatedSettlements.get(0);
        assertThat(UUID.fromString(remainingStep.get("debtorId").asText())).isEqualTo(charlieSession.userId());
        assertThat(UUID.fromString(remainingStep.get("creditorId").asText())).isEqualTo(aliceSession.userId());
        assertThat(new BigDecimal(remainingStep.get("amount").asText())).isEqualByComparingTo("150");
        UUID secondPaymentId = UUID.fromString(remainingStep.get("paymentId").asText());

        // --- 10. Чарли отправляет платеж, Алиса отклоняет ---
        webTestClient.post().uri("/events/" + eventId + "/payments/" + secondPaymentId + "/sent")
                .header("Cookie", charlieSession.cookie())
                .exchange()
                .expectStatus().isOk();

        webTestClient.post().uri("/events/" + eventId + "/payments/" + secondPaymentId + "/fail")
                .header("Cookie", aliceSession.cookie())
                .exchange()
                .expectStatus().isOk();

        // Проверяем что settlements снова показывают долг Чарли
        String finalSettlementsStr = webTestClient.get().uri("/events/" + eventId + "/settlements")
                .header("Cookie", aliceSession.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        JsonNode finalSettlementsResponse = objectMapper.readTree(finalSettlementsStr);
        JsonNode finalSettlements = finalSettlementsResponse.get("settlements");
        assertThat(finalSettlements.size()).isEqualTo(2);
        List<String> finalStatuses = List.of(
                finalSettlements.get(0).get("status").asText(),
                finalSettlements.get(1).get("status").asText()
        );
        assertThat(finalStatuses).containsExactlyInAnyOrder("FAILED", "ACTIVE");
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
