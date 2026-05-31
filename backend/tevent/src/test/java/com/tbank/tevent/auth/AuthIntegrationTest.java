package com.tbank.tevent.auth;

import com.tbank.tevent.BaseIntegrationTest;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.repo.InviteTokenRepository;
import com.tbank.tevent.repo.InvitationRepository;
import com.tbank.tevent.repo.UserRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.entity.InviteToken;
import com.tbank.tevent.repo.entity.User;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class AuthIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InviteTokenRepository inviteTokenRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private InvitationRepository invitationRepository;

    @Test
    // Проверяет, что регистрация возвращает 201, user_id и auth cookies
    void registerReturnCreatedAndSetCookies() throws Exception {

        String login = "user_" + UUID.randomUUID().toString().substring(0,8);

        MvcResult result = mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerPayload(login, "StrongPass123")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user_id").isNotEmpty())
                .andReturn();

        assertThat(result.getResponse().getCookie("accessToken")).isNotNull();
        assertThat(result.getResponse().getCookie("refreshToken")).isNotNull();
    }

    @Test
    // Проверяет, что повторная регистрация с тем же login возвращает 409
    void registerWithDuplicateLoginReturnsConflict() throws Exception {
        String login = "dup_" + UUID.randomUUID().toString().substring(0, 8);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload(login, "StrongPass123")))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload(login, "StrongPass123")))
                .andExpect(status().isConflict());
    }

    @Test
    // Проверяет, что невалидный payload при регистрации возвращает 400
    void registerWithInvalidPayloadReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload("", "123")))
                .andExpect(status().isBadRequest());
    }

    @Test
    // Проверяет, что регистрация с invite_token возвращает joined_group_id события
    void registerWithInviteTokenReturnsJoinedGroupId() throws Exception {
        User owner = userRepository.saveAndFlush(User.builder()
                .login("owner_" + UUID.randomUUID().toString().substring(0, 8))
                .passwordHash("hash")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        InviteToken token = inviteTokenRepository.saveAndFlush(InviteToken.builder()
                .token("invite_" + UUID.randomUUID())
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build());

        Event event = eventRepository.saveAndFlush(Event.builder()
                .title("Invite Event")
                .description("for auth test")
                .startDate(LocalDateTime.now().plusDays(1))
                .endDate(LocalDateTime.now().plusDays(2))
                .ownerId(owner.getId())
                .inviteTokenId(token.getId())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .isCompleted(false)
                .build());

        String login = "invited_" + UUID.randomUUID().toString().substring(0, 8);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayloadWithInvite(login, "StrongPass123", token.getToken())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.joined_group_id").value(event.getId().toString()));

        User registered = userRepository.findByLogin(login).orElseThrow();
        assertThat(invitationRepository.existsByEventIdAndUserId(event.getId(), registered.getId())).isTrue();
    }

    @Test
    // Проверяет, что логин возвращает 200 и выставляет auth cookies
    void loginReturnsOkAndSetsCookies() throws Exception {
        String login = "login_" + UUID.randomUUID().toString().substring(0, 8);
        String password = "StrongPass123";

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload(login, password)))
                .andExpect(status().isCreated());

        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload(login, password)))
                .andExpect(status().isOk())
                .andReturn();

        assertThat(loginResult.getResponse().getCookie("accessToken")).isNotNull();
        assertThat(loginResult.getResponse().getCookie("refreshToken")).isNotNull();
    }

    @Test
    // Проверяет, что логин с неверным паролем возвращает 401
    void loginWithWrongPasswordReturnsUnauthorized() throws Exception {
        String login = "wrong_pwd_" + UUID.randomUUID().toString().substring(0, 8);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload(login, "StrongPass123")))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload(login, "WrongPass123")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    // Проверяет, что /auth/me с валидной access cookie возвращает пользователя
    void meReturnsCurrentUserForAuthorizedRequest() throws Exception {
        String login = "me_" + UUID.randomUUID().toString().substring(0, 8);

        MvcResult registerResult = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload(login, "StrongPass123")))
                .andExpect(status().isCreated())
                .andReturn();

        Cookie accessCookie = registerResult.getResponse().getCookie("accessToken");
        String userId = userRepository.findByLogin(login).orElseThrow().getId().toString();

        mockMvc.perform(get("/auth/me").cookie(accessCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user_id").value(userId))
                .andExpect(jsonPath("$.login").value(login));
    }

    @Test
    // Проверяет, что /auth/me без авторизации возвращает 401
    void meWithoutAuthReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    // Проверяет refresh: новые cookies выдаются, старый refresh повторно использовать нельзя
    void refreshRotatesCookiesAndOldRefreshTokenBecomesInvalid() throws Exception {
        String login = "refresh_" + UUID.randomUUID().toString().substring(0, 8);

        MvcResult registerResult = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload(login, "StrongPass123")))
                .andExpect(status().isCreated())
                .andReturn();

        Cookie oldRefreshCookie = registerResult.getResponse().getCookie("refreshToken");
        Thread.sleep(1200);

        MvcResult refreshResult = mockMvc.perform(post("/auth/refresh")
                        .cookie(oldRefreshCookie))
                .andExpect(status().isOk())
                .andReturn();

        String setCookies = String.join(";", refreshResult.getResponse().getHeaders(HttpHeaders.SET_COOKIE));
        assertThat(setCookies).contains("accessToken=").contains("refreshToken=");

        mockMvc.perform(post("/auth/refresh")
                        .cookie(oldRefreshCookie))
                .andExpect(status().isUnauthorized());
    }

    @Test
    // Проверяет, что /auth/refresh без cookie refreshToken возвращает 401
    void refreshWithoutCookieReturnsUnauthorized() throws Exception {
        mockMvc.perform(post("/auth/refresh"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    // Проверяет, что logout очищает обе auth cookies
    void logoutClearsCookies() throws Exception {
        String login = "logout_" + UUID.randomUUID().toString().substring(0, 8);

        MvcResult registerResult = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload(login, "StrongPass123")))
                .andExpect(status().isCreated())
                .andReturn();

        Cookie accessCookie = registerResult.getResponse().getCookie("accessToken");

        MvcResult logoutResult = mockMvc.perform(post("/auth/logout")
                        .cookie(accessCookie))
                .andExpect(status().isNoContent())
                .andReturn();

        String setCookies = String.join(";", logoutResult.getResponse().getHeaders(HttpHeaders.SET_COOKIE));
        assertThat(setCookies).contains("accessToken=");
        assertThat(setCookies).contains("refreshToken=");
        assertThat(setCookies).contains("Max-Age=0");
    }

    private String registerPayload(String login, String password) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("login", login);
        payload.put("password", password);
        return toJson(payload);
    }

    private String registerPayloadWithInvite(String login, String password, String inviteToken) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("login", login);
        payload.put("password", password);
        payload.put("invite_token", inviteToken);
        return toJson(payload);
    }

    private String loginPayload(String login, String password) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("login", login);
        payload.put("password", password);
        return toJson(payload);
    }

    private String toJson(Object payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize payload", e);
        }
    }

}
