package com.tbank.tevent.event;

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

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class EventIntegrationTest {

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
    void shouldGoThroughFullEventLifecycle() throws Exception {
        // --- 1. Регистрация Алисы ---
        var aliceSession = registerUser("alice", "alice@test.com", "passsss123", null);

        // --- 2. Алиса создает событие ---
        Map<String, Object> eventReq = Map.of(
                "title", "Global Party",
                "description", "Best party ever",
                "startDate", LocalDateTime.now().plusDays(1).toString(),
                "endDate", LocalDateTime.now().plusDays(2).toString(),
                "image_key", "custom-image-key",
                "categories", List.of("Music", "Food")
        );

        String eventRespStr = webTestClient.post().uri("/events")
                .header("Cookie", aliceSession.cookie())
                .bodyValue(eventReq)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(String.class).returnResult().getResponseBody();

        JsonNode createdEvent = objectMapper.readTree(eventRespStr);
        UUID eventId = UUID.fromString(createdEvent.get("id").asText());
        assertThat(createdEvent.get("image_key").asText()).isEqualTo("custom-image-key");

        // --- 3. Алиса получает токен инвайта ---
        String tokenRespStr = webTestClient.get().uri("/events/" + eventId + "/token")
                .header("Cookie", aliceSession.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        String inviteToken = objectMapper.readTree(tokenRespStr).get("token").asText();

        // --- 4. Регистрация Боба по токену ---
        // (AuthService.register вызовет inviteService.applyToken)
        var bobSession = registerUser("bob", "bob@test.com", "passsss123", inviteToken);

        // --- 5. Алиса видит входящую заявку от Боба ---
        String inboxStr = webTestClient.get().uri("/invitations/inbox")
                .header("Cookie", aliceSession.cookie())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        JsonNode inbox = objectMapper.readTree(inboxStr);
        assertThat(inbox.isArray()).isTrue();
        UUID invitationId = UUID.fromString(inbox.get(0).get("id").asText());
        assertThat(inbox.get(0).get("login").asText()).isEqualTo("bob");

        // --- 6. Алиса одобряет Боба ---
        webTestClient.patch().uri("/invitations/" + invitationId + "/decide")
                .header("Cookie", aliceSession.cookie())
                .bodyValue(Map.of("status", "ACCEPTED"))
                .exchange()
                .expectStatus().isNoContent();

        // --- 7. Проверка: Боб теперь участник ---
        String participantsStr = webTestClient.get().uri("/events/" + eventId + "/participants")
                .header("Cookie", bobSession.cookie()) // Боб тоже может смотреть список
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).returnResult().getResponseBody();

        JsonNode participants = objectMapper.readTree(participantsStr).get("participants");

        // Превращаем в список логинов для удобной проверки
        List<String> logins = new ArrayList<>();
        participants.forEach(p -> logins.add(p.get("login").asText()));

        assertThat(logins).containsExactlyInAnyOrder("alice", "bob");
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
