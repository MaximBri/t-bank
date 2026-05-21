package com.tbank.tevent.history.integration;

import com.tbank.tevent.TestcontainersConfiguration;
import com.tbank.tevent.auth.AuthCookieService;
import com.tbank.tevent.history.EventHistoryResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("test")
@AutoConfigureMockMvc
@SpringBootTest
@Import(TestcontainersConfiguration.class)
class EventHistoryIntegrationTest {

    protected static final String PASSWORD = "password123";

    @Autowired
    protected MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);

    @Test
    void getEventHistory_returnsEmptyListForNewEvent() throws Exception {
        // Given: a registered user and an event
        String login = uniqueLogin();
        register(login, PASSWORD);
        Cookie accessCookie = loginAndGetAccessTokenCookie(login, PASSWORD);

        UUID eventId = createEvent(accessCookie);

        // When: fetching event history
        MvcResult result = mockMvc.perform(get("/events/{eventId}/history", eventId)
                        .cookie(accessCookie))
                .andExpect(status().isOk())
                .andReturn();

        // Then: returns empty array
        String content = result.getResponse().getContentAsString();
        List<EventHistoryResponse> history = objectMapper.readValue(content, new TypeReference<>() {});
        assertThat(history).isEmpty();
    }

    @Test
    void getEventHistory_returnsValidResponseStructure() throws Exception {
        // Given: a registered user and an event
        String login = uniqueLogin();
        register(login, PASSWORD);
        Cookie accessCookie = loginAndGetAccessTokenCookie(login, PASSWORD);

        UUID eventId = createEvent(accessCookie);

        // When: fetching event history
        MvcResult result = mockMvc.perform(get("/events/{eventId}/history", eventId)
                        .cookie(accessCookie))
                .andExpect(status().isOk())
                .andReturn();

        // Then: returns a valid JSON array (may be empty)
        String content = result.getResponse().getContentAsString();
        List<EventHistoryResponse> history = objectMapper.readValue(content, new TypeReference<>() {});
        assertThat(history).isNotNull();
        // Verify each entry has required fields if present
        for (EventHistoryResponse entry : history) {
            assertThat(entry.id()).isNotNull();
            assertThat(entry.eventId()).isEqualTo(eventId);
            assertThat(entry.userId()).isNotNull();
            assertThat(entry.actionType()).isNotEmpty();
            assertThat(entry.createdAt()).isNotNull();
        }
    }

    @Test
    void getEventHistory_unauthorizedForNonMember() throws Exception {
        // Given: two users and an event created by first user
        String ownerLogin = uniqueLogin();
        register(ownerLogin, PASSWORD);
        Cookie ownerAccessCookie = loginAndGetAccessTokenCookie(ownerLogin, PASSWORD);
        UUID eventId = createEvent(ownerAccessCookie);

        // Second user (not a member of the event)
        String nonMemberLogin = uniqueLogin();
        register(nonMemberLogin, PASSWORD);
        Cookie nonMemberAccessCookie = loginAndGetAccessTokenCookie(nonMemberLogin, PASSWORD);

        // When: non-member tries to fetch event history
        mockMvc.perform(get("/events/{eventId}/history", eventId)
                        .cookie(nonMemberAccessCookie))
                .andExpect(status().isForbidden());
    }

    @Test
    void getEventHistory_unauthenticatedUserReceives401() throws Exception {
        // Given: an event exists
        String login = uniqueLogin();
        register(login, PASSWORD);
        Cookie accessCookie = loginAndGetAccessTokenCookie(login, PASSWORD);
        UUID eventId = createEvent(accessCookie);

        // When: unauthenticated request (no cookie)
        mockMvc.perform(get("/events/{eventId}/history", eventId))
                .andExpect(status().isUnauthorized());
    }

    // Helper methods copied from AbstractAuthIntegrationTest
    protected void register(String login, String password) throws Exception {
        registerAndReturnResult(login, password);
    }

    protected Cookie registerAndGetRefreshTokenCookie(String login, String password) throws Exception {
        MvcResult result = registerAndReturnResult(login, password);
        return result.getResponse().getCookie(AuthCookieService.REFRESH_TOKEN_COOKIE);
    }

    protected MvcResult registerAndReturnResult(String login, String password) throws Exception {
        return mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson(login, password)))
                .andExpect(status().isCreated())
                .andReturn();
    }

    protected Cookie loginAndGetAccessTokenCookie(String login, String password) throws Exception {
        MvcResult result = loginAndReturnResult(login, password);
        return result.getResponse().getCookie(AuthCookieService.ACCESS_TOKEN_COOKIE);
    }

    protected Cookie loginAndGetRefreshTokenCookie(String login, String password) throws Exception {
        MvcResult result = loginAndReturnResult(login, password);
        return result.getResponse().getCookie(AuthCookieService.REFRESH_TOKEN_COOKIE);
    }

    protected MvcResult loginAndReturnResult(String login, String password) throws Exception {
        return mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson(login, password)))
                .andExpect(status().isOk())
                .andReturn();
    }

    protected String registerJson(String login, String password) {
        return """
                {
                  "login": "%s",
                  "password": "%s",
                  "firstName": "Test",
                  "secondName": "User"
                }
                """.formatted(login, password);
    }

    protected String loginJson(String login, String password) {
        return """
                {
                  "login": "%s",
                  "password": "%s"
                }
                """.formatted(login, password);
    }

    protected String uniqueLogin() {
        return "user-" + UUID.randomUUID();
    }

    private UUID createEvent(Cookie accessCookie) throws Exception {
        Map<String, Object> eventRequest = Map.of(
                "title", "Test Event",
                "description", "Event for history testing",
                "startDate", LocalDateTime.now().plusDays(1).toString(),
                "endDate", LocalDateTime.now().plusDays(2).toString(),
                "image_key", "test-image",
                "categories", List.of("Food", "Travel")
        );

        MvcResult result = mockMvc.perform(post("/events")
                        .cookie(accessCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(eventRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        return UUID.fromString(objectMapper.readTree(responseBody).get("id").asText());
    }
}