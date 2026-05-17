package com.tbank.tevent.s3;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class S3IntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withEnv("LC_ALL", "en_US.UTF-8")
            .withEnv("POSTGRES_INITDB_ARGS", "--lc-messages=en_US.UTF-8")
            .withReuse(true);

    @LocalServerPort
    private int port;

    private WebTestClient webTestClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        this.webTestClient = WebTestClient.bindToServer()
                .baseUrl("http://localhost:" + port)
                .build();
    }

    @Test
    void createUploadUrlShouldReturnBadRequestWhenFileSizeExceedsLimit() throws Exception {
        String cookie = registerUser("s3user", "passsss123");

        String body = webTestClient.post().uri("/s3/upload")
                .header("Cookie", cookie)
                .bodyValue(Map.of(
                        "file_name", "check",
                        "content_type", "image/jpeg",
                        "file_size_bytes", 3 * 1024 * 1024 + 1
                ))
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody(String.class)
                .returnResult()
                .getResponseBody();

        JsonNode error = objectMapper.readTree(body);
        assertThat(error.get("status").asInt()).isEqualTo(400);
    }

    private String registerUser(String login, String password) {
        Map<String, Object> req = new HashMap<>();
        req.put("login", login);
        req.put("password", password);
        req.put("firstName", login);
        req.put("secondName", "Family");

        var result = webTestClient.post().uri("/auth/register")
                .bodyValue(req)
                .exchange()
                .expectStatus().isCreated()
                .returnResult(String.class);

        String cookie = result.getResponseHeaders().getFirst("Set-Cookie");
        if (cookie != null && cookie.contains(";")) {
            cookie = cookie.split(";")[0];
        }
        return cookie;
    }
}
