package com.tbank.tevent.event;

import com.tbank.tevent.TestcontainersConfiguration;
import com.tbank.tevent.auth.dto.RegisterRequest;
import com.tbank.tevent.event.dto.EventRequest;
import com.tbank.tevent.event.dto.EventResponse;
import com.tbank.tevent.event.dto.EventsResponse;
import com.tbank.tevent.event.dto.ParticipantsResponse;
import com.tbank.tevent.exception.ApiError;
import com.tbank.tevent.invite_token.EventTokenResponse;
import com.tbank.tevent.repo.CategoryEventRepository;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.EventUserRepository;
import com.tbank.tevent.repo.InvitationRepository;
import com.tbank.tevent.repo.InviteTokenRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.EventInvitation;
import com.tbank.tevent.repo.entity.EventUser;
import com.tbank.tevent.s3.S3Service;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class EventControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventUserRepository eventUserRepository;

    @Autowired
    private InviteTokenRepository inviteTokenRepository;

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private CategoryEventRepository categoryEventRepository;

    @MockitoBean
    private S3Service s3Service;

    private static final String USER_PASSWORD = "password123";

    private String accessToken;
    private String accessToken2;
    private UUID userId;
    private UUID userId2;
    private String userLogin;

    @BeforeEach
    void setUp() {
        // Mock S3Service to avoid real S3 calls
        doNothing().when(s3Service).useKey(anyString());

        // Register first user with unique login to avoid 409 conflicts across tests
        userLogin = "testuser-" + UUID.randomUUID();
        var result1 = registerUserAndGetId(userLogin, USER_PASSWORD);
        accessToken = result1.accessToken;
        userId = result1.userId;

        // Register second user with unique login
        var login2 = "testuser-" + UUID.randomUUID();
        var result2 = registerUserAndGetId(login2, USER_PASSWORD);
        accessToken2 = result2.accessToken;
        userId2 = result2.userId;
    }

    @AfterEach
    void tearDown() {
        // Clean up in FK order: category_event → event_user → event_invitation → event → invite_token
        categoryEventRepository.deleteAll();
        eventUserRepository.deleteAll();
        invitationRepository.deleteAll();
        eventRepository.deleteAll();
        inviteTokenRepository.deleteAll();
    }

    // ==================== Helper Methods ====================

    private record UserRegistration(String accessToken, UUID userId) {}

    private UserRegistration registerUserAndGetId(String login, String password) {
        var request = new RegisterRequest(login, password, "Test", "User", null);
        var response = restTemplate.postForEntity("/auth/register", request,
                com.tbank.tevent.auth.dto.RegisterResponse.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();

        List<String> cookies = response.getHeaders().get(HttpHeaders.SET_COOKIE);
        assertThat(cookies).isNotNull();

        String token = extractCookieValue(cookies, "accessToken");
        return new UserRegistration(token, response.getBody().userId());
    }

    private String extractCookieValue(List<String> cookies, String cookieName) {
        return cookies.stream()
                .filter(c -> c.startsWith(cookieName + "="))
                .map(c -> c.substring((cookieName + "=").length()))
                .map(c -> c.contains(";") ? c.substring(0, c.indexOf(';')) : c)
                .findFirst()
                .orElseThrow(() -> new AssertionError("Cookie " + cookieName + " not found"));
    }

    private HttpHeaders createAuthHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.COOKIE, "accessToken=" + token);
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json");
        return headers;
    }

    private EventRequest createValidEventRequest() {
        return new EventRequest(
                "Test Event",
                "Test Description",
                LocalDateTime.now().plusDays(1),
                LocalDateTime.now().plusDays(2),
                null,
                List.of("Food", "Drinks")
        );
    }

    private EventRequest createValidEventRequest(String title) {
        return new EventRequest(
                title,
                "Test Description",
                LocalDateTime.now().plusDays(1),
                LocalDateTime.now().plusDays(2),
                null,
                List.of("Food", "Drinks")
        );
    }

    private UUID createEvent(String token) {
        EventRequest request = createValidEventRequest();
        HttpHeaders headers = createAuthHeaders(token);
        HttpEntity<EventRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<EventResponse> response = restTemplate.exchange(
                "/events", HttpMethod.POST, entity, EventResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        return response.getBody().id();
    }

    private String getInviteTokenValue(String token, UUID eventId) {
        HttpHeaders headers = createAuthHeaders(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<EventTokenResponse> response = restTemplate.exchange(
                "/events/" + eventId + "/token", HttpMethod.GET, entity, EventTokenResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        return response.getBody().token();
    }

    // ==================== Tests ====================

    @Nested
    @DisplayName("POST /events - Create Event")
    class CreateEventTests {

        @Test
        @DisplayName("Should create event successfully")
        void shouldCreateEventSuccessfully() {
            EventRequest request = createValidEventRequest();
            HttpHeaders headers = createAuthHeaders(accessToken);
            HttpEntity<EventRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<EventResponse> response = restTemplate.exchange(
                    "/events", HttpMethod.POST, entity, EventResponse.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().id()).isNotNull();
            assertThat(response.getBody().title()).isEqualTo("Test Event");
            assertThat(response.getBody().description()).isEqualTo("Test Description");
            assertThat(response.getBody().categories()).containsExactlyInAnyOrder("Food", "Drinks");
            assertThat(response.getBody().ownerId()).isEqualTo(userId);
            assertThat(response.getBody().countOfParticipants()).isEqualTo(1);
            assertThat(response.getBody().status()).isEqualTo("PLANNED");
            assertThat(response.getBody().creatorInfo()).isNotNull();
            assertThat(response.getBody().creatorInfo().login()).isEqualTo(userLogin);
        }

        @Test
        @DisplayName("Should return 400 when title is missing")
        void shouldReturn400WhenTitleIsMissing() {
            var request = new EventRequest(
                    null, "Description",
                    LocalDateTime.now().plusDays(1),
                    LocalDateTime.now().plusDays(2),
                    null, List.of("Food")
            );
            HttpHeaders headers = createAuthHeaders(accessToken);
            HttpEntity<EventRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events", HttpMethod.POST, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }

        @Test
        @DisplayName("Should return 400 when startDate is missing")
        void shouldReturn400WhenStartDateIsMissing() {
            var request = new EventRequest(
                    "Title", "Description",
                    null,
                    LocalDateTime.now().plusDays(2),
                    null, List.of("Food")
            );
            HttpHeaders headers = createAuthHeaders(accessToken);
            HttpEntity<EventRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events", HttpMethod.POST, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }

        @Test
        @DisplayName("Should return 400 when endDate is missing")
        void shouldReturn400WhenEndDateIsMissing() {
            var request = new EventRequest(
                    "Title", "Description",
                    LocalDateTime.now().plusDays(1),
                    null,
                    null, List.of("Food")
            );
            HttpHeaders headers = createAuthHeaders(accessToken);
            HttpEntity<EventRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events", HttpMethod.POST, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }

        @Test
        @DisplayName("Should return 400 when startDate is after endDate")
        void shouldReturn400WhenStartDateIsAfterEndDate() {
            var request = new EventRequest(
                    "Title", "Description",
                    LocalDateTime.now().plusDays(5),
                    LocalDateTime.now().plusDays(2),
                    null, List.of("Food")
            );
            HttpHeaders headers = createAuthHeaders(accessToken);
            HttpEntity<EventRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events", HttpMethod.POST, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }

        @Test
        @DisplayName("Should return 400 when startDate is in the past")
        void shouldReturn400WhenStartDateIsInThePast() {
            var request = new EventRequest(
                    "Title", "Description",
                    LocalDateTime.now().minusDays(1),
                    LocalDateTime.now().plusDays(2),
                    null, List.of("Food")
            );
            HttpHeaders headers = createAuthHeaders(accessToken);
            HttpEntity<EventRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events", HttpMethod.POST, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() {
            EventRequest request = createValidEventRequest();
            HttpEntity<EventRequest> entity = new HttpEntity<>(request, new HttpHeaders());

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events", HttpMethod.POST, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    @Nested
    @DisplayName("GET /events/{eventId} - Get Event")
    class GetEventTests {

        @Test
        @DisplayName("Should get event by ID successfully")
        void shouldGetEventById() {
            UUID eventId = createEvent(accessToken);

            HttpHeaders headers = createAuthHeaders(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<EventResponse> response = restTemplate.exchange(
                    "/events/" + eventId, HttpMethod.GET, entity, EventResponse.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().id()).isEqualTo(eventId);
            assertThat(response.getBody().title()).isEqualTo("Test Event");
            assertThat(response.getBody().ownerId()).isEqualTo(userId);
        }

        @Test
        @DisplayName("Should return 404 when event not found")
        void shouldReturn404WhenEventNotFound() {
            UUID nonExistentId = UUID.randomUUID();
            HttpHeaders headers = createAuthHeaders(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + nonExistentId, HttpMethod.GET, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }

        @Test
        @DisplayName("Should return 403 when user is not a participant")
        void shouldReturn403WhenUserIsNotParticipant() {
            UUID eventId = createEvent(accessToken);

            // Second user tries to access event they're not a participant of
            HttpHeaders headers = createAuthHeaders(accessToken2);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + eventId, HttpMethod.GET, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() {
            UUID eventId = createEvent(accessToken);

            HttpEntity<Void> entity = new HttpEntity<>(new HttpHeaders());

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + eventId, HttpMethod.GET, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    @Nested
    @DisplayName("GET /events/preview/{token} - Get Event Preview")
    class GetEventPreviewTests {

        @Test
        @DisplayName("Should get event preview by token (public endpoint)")
        void shouldGetEventPreviewByToken() {
            UUID eventId = createEvent(accessToken);
            String token = getInviteTokenValue(accessToken, eventId);

            // Public endpoint - no auth required
            ResponseEntity<com.tbank.tevent.event.dto.EventPreviewResponse> response = restTemplate.getForEntity(
                    "/events/preview/" + token,
                    com.tbank.tevent.event.dto.EventPreviewResponse.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().eventId()).isEqualTo(eventId);
            assertThat(response.getBody().title()).isEqualTo("Test Event");
            assertThat(response.getBody().participantCount()).isEqualTo(1);
            assertThat(response.getBody().creatorInfo()).isNotNull();
            assertThat(response.getBody().creatorInfo().login()).isEqualTo(userLogin);
        }

        @Test
        @DisplayName("Should return 404 when token is invalid")
        void shouldReturn404WhenTokenIsInvalid() {
            ResponseEntity<ApiError> response = restTemplate.getForEntity(
                    "/events/preview/invalid-token", ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("POST /events/{token}/apply - Apply to Event")
    class ApplyToEventTests {

        @Test
        @DisplayName("Should apply to event successfully")
        void shouldApplyToEventSuccessfully() {
            UUID eventId = createEvent(accessToken);
            String token = getInviteTokenValue(accessToken, eventId);

            HttpHeaders headers = createAuthHeaders(accessToken2);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Void> response = restTemplate.exchange(
                    "/events/" + token + "/apply", HttpMethod.POST, entity, Void.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

            // Verify invitation was created
            List<EventInvitation> invitations = invitationRepository.findAllByEventIdAndStatus(eventId, "PENDING");
            assertThat(invitations).hasSize(1);
            assertThat(invitations.get(0).getUserId()).isEqualTo(userId2);
        }

        @Test
        @DisplayName("Should return 409 when already applied")
        void shouldReturn409WhenAlreadyApplied() {
            UUID eventId = createEvent(accessToken);
            String token = getInviteTokenValue(accessToken, eventId);

            // First application
            HttpHeaders headers = createAuthHeaders(accessToken2);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            restTemplate.exchange("/events/" + token + "/apply", HttpMethod.POST, entity, Void.class);

            // Second application - should fail
            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + token + "/apply", HttpMethod.POST, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() {
            UUID eventId = createEvent(accessToken);
            String token = getInviteTokenValue(accessToken, eventId);

            HttpEntity<Void> entity = new HttpEntity<>(new HttpHeaders());

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + token + "/apply", HttpMethod.POST, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    @Nested
    @DisplayName("PATCH /events/{eventId} - Update Event")
    class UpdateEventTests {

        @Test
        @DisplayName("Should update event successfully")
        void shouldUpdateEventSuccessfully() {
            UUID eventId = createEvent(accessToken);

            var updateRequest = new EventRequest(
                    "Updated Title",
                    "Updated Description",
                    LocalDateTime.now().plusDays(3),
                    LocalDateTime.now().plusDays(5),
                    null,
                    List.of("NewCategory")
            );
            HttpHeaders headers = createAuthHeaders(accessToken);
            HttpEntity<EventRequest> entity = new HttpEntity<>(updateRequest, headers);

            ResponseEntity<EventResponse> response = restTemplate.exchange(
                    "/events/" + eventId, HttpMethod.PATCH, entity, EventResponse.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().title()).isEqualTo("Updated Title");
            assertThat(response.getBody().description()).isEqualTo("Updated Description");
            assertThat(response.getBody().categories()).containsExactly("NewCategory");
        }

        @Test
        @DisplayName("Should return 403 when not the owner")
        void shouldReturn403WhenNotOwner() {
            UUID eventId = createEvent(accessToken);

            var updateRequest = createValidEventRequest("Hacked Title");
            HttpHeaders headers = createAuthHeaders(accessToken2);
            HttpEntity<EventRequest> entity = new HttpEntity<>(updateRequest, headers);

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + eventId, HttpMethod.PATCH, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() {
            UUID eventId = createEvent(accessToken);

            var updateRequest = createValidEventRequest("Hacked Title");
            HttpEntity<EventRequest> entity = new HttpEntity<>(updateRequest, new HttpHeaders());

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + eventId, HttpMethod.PATCH, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    @Nested
    @DisplayName("GET /events/user/events - Get User Events")
    class GetUserEventsTests {

        @Test
        @DisplayName("Should get all user events without filters")
        void shouldGetAllUserEvents() {
            createEvent(accessToken);
            createEvent(accessToken);

            HttpHeaders headers = createAuthHeaders(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<EventsResponse> response = restTemplate.exchange(
                    "/events/user/events", HttpMethod.GET, entity, EventsResponse.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().events()).hasSize(2);
        }



        @Test
        @DisplayName("Should filter events by search term")
        void shouldFilterEventsBySearch() {
            createEvent(accessToken);

            HttpHeaders headers = createAuthHeaders(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<EventsResponse> response = restTemplate.exchange(
                    "/events/user/events?search=Test", HttpMethod.GET, entity, EventsResponse.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().events()).isNotEmpty();
        }

        @Test
        @DisplayName("Should return empty list when no events match filters")
        void shouldReturnEmptyListWhenNoMatch() {
            createEvent(accessToken);

            HttpHeaders headers = createAuthHeaders(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<EventsResponse> response = restTemplate.exchange(
                    "/events/user/events?search=NonExistent", HttpMethod.GET, entity, EventsResponse.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().events()).isEmpty();
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() {
            HttpEntity<Void> entity = new HttpEntity<>(new HttpHeaders());

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/user/events", HttpMethod.GET, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    @Nested
    @DisplayName("GET /events/{eventId}/participants - Get Participants")
    class GetParticipantsTests {

        @Test
        @DisplayName("Should get participants successfully")
        void shouldGetParticipants() {
            UUID eventId = createEvent(accessToken);

            HttpHeaders headers = createAuthHeaders(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<ParticipantsResponse> response = restTemplate.exchange(
                    "/events/" + eventId + "/participants", HttpMethod.GET, entity, ParticipantsResponse.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().participants()).hasSize(1);
            assertThat(response.getBody().participants().get(0).login()).isEqualTo(userLogin);
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() {
            UUID eventId = createEvent(accessToken);

            HttpEntity<Void> entity = new HttpEntity<>(new HttpHeaders());

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + eventId + "/participants", HttpMethod.GET, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    @Nested
    @DisplayName("DELETE /events/{eventId}/participants/{userId} - Remove Participant")
    class RemoveParticipantTests {

        @Test
        @DisplayName("Should remove participant successfully")
        void shouldRemoveParticipantSuccessfully() {
            UUID eventId = createEvent(accessToken);

            // Add second user as participant by directly creating EventUser
            EventUser eventUser = new EventUser();
            eventUser.setEventId(eventId);
            eventUser.setUserId(userId2);
            eventUser.setRole("MEMBER");
            eventUser.setJoinedAt(LocalDateTime.now());
            eventUserRepository.saveAndFlush(eventUser);

            HttpHeaders headers = createAuthHeaders(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Void> response = restTemplate.exchange(
                    "/events/" + eventId + "/participants/" + userId2,
                    HttpMethod.DELETE, entity, Void.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

            // Verify user is no longer a participant
            assertThat(eventUserRepository.existsByEventIdAndUserId(eventId, userId2)).isFalse();
        }

        @Test
        @DisplayName("Should return 403 when not the owner")
        void shouldReturn403WhenNotOwner() {
            UUID eventId = createEvent(accessToken);

            HttpHeaders headers = createAuthHeaders(accessToken2);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + eventId + "/participants/" + userId,
                    HttpMethod.DELETE, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() {
            UUID eventId = createEvent(accessToken);

            HttpEntity<Void> entity = new HttpEntity<>(new HttpHeaders());

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + eventId + "/participants/" + userId2,
                    HttpMethod.DELETE, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    @Nested
    @DisplayName("DELETE /events/{eventId}/exit - Leave Event")
    class LeaveEventTests {

        @Test
        @DisplayName("Should leave event successfully")
        void shouldLeaveEventSuccessfully() {
            UUID eventId = createEvent(accessToken);

            // Add second user as participant
            EventUser eventUser = new EventUser();
            eventUser.setEventId(eventId);
            eventUser.setUserId(userId2);
            eventUser.setRole("MEMBER");
            eventUser.setJoinedAt(LocalDateTime.now());
            eventUserRepository.saveAndFlush(eventUser);

            HttpHeaders headers = createAuthHeaders(accessToken2);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Void> response = restTemplate.exchange(
                    "/events/" + eventId + "/exit", HttpMethod.DELETE, entity, Void.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

            // Verify user is no longer a participant
            assertThat(eventUserRepository.existsByEventIdAndUserId(eventId, userId2)).isFalse();
        }

        @Test
        @DisplayName("Should return 409 when owner tries to leave")
        void shouldReturn409WhenOwnerTriesToLeave() {
            UUID eventId = createEvent(accessToken);

            HttpHeaders headers = createAuthHeaders(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + eventId + "/exit", HttpMethod.DELETE, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() {
            UUID eventId = createEvent(accessToken);

            HttpEntity<Void> entity = new HttpEntity<>(new HttpHeaders());

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + eventId + "/exit", HttpMethod.DELETE, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    @Nested
    @DisplayName("POST /events/{eventId}/complete - Complete Event")
    class CompleteEventTests {

        @Test
        @DisplayName("Should complete event successfully")
        void shouldCompleteEventSuccessfully() {
            UUID eventId = createEvent(accessToken);

            HttpHeaders headers = createAuthHeaders(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<EventResponse> response = restTemplate.exchange(
                    "/events/" + eventId + "/complete", HttpMethod.POST, entity, EventResponse.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().status()).isEqualTo("COMPLETED");

            // Verify event state in DB
            Optional<Event> event = eventRepository.findById(eventId);
            assertThat(event).isPresent();
            assertThat(event.get().getState()).isEqualTo("COMPLETED");
        }

        @Test
        @DisplayName("Should return 403 when not the owner")
        void shouldReturn403WhenNotOwner() {
            UUID eventId = createEvent(accessToken);

            HttpHeaders headers = createAuthHeaders(accessToken2);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + eventId + "/complete", HttpMethod.POST, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() {
            UUID eventId = createEvent(accessToken);

            HttpEntity<Void> entity = new HttpEntity<>(new HttpHeaders());

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + eventId + "/complete", HttpMethod.POST, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    @Nested
    @DisplayName("GET /events/{eventId}/token - Get Invite Token")
    class GetInviteTokenTests {

        @Test
        @DisplayName("Should get invite token successfully")
        void shouldGetInviteTokenSuccessfully() {
            UUID eventId = createEvent(accessToken);

            HttpHeaders headers = createAuthHeaders(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<EventTokenResponse> response = restTemplate.exchange(
                    "/events/" + eventId + "/token", HttpMethod.GET, entity, EventTokenResponse.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().token()).isNotBlank();
            assertThat(response.getBody().expiresAt()).isNotNull();
        }

        @Test
        @DisplayName("Should return 403 when not the owner")
        void shouldReturn403WhenNotOwner() {
            UUID eventId = createEvent(accessToken);

            HttpHeaders headers = createAuthHeaders(accessToken2);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + eventId + "/token", HttpMethod.GET, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() {
            UUID eventId = createEvent(accessToken);

            HttpEntity<Void> entity = new HttpEntity<>(new HttpHeaders());

            ResponseEntity<ApiError> response = restTemplate.exchange(
                    "/events/" + eventId + "/token", HttpMethod.GET, entity, ApiError.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }
}