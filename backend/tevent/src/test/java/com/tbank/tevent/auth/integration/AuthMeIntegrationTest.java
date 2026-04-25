package com.tbank.tevent.auth.integration;

import com.tbank.tevent.auth.AuthCookieService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthMeIntegrationTest extends AbstractAuthIntegrationTest {

    @Test
    void meRequiresAccessToken() throws Exception {
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meReturnsCurrentUserForValidAccessTokenCookie() throws Exception {
        String login = uniqueLogin();
        register(login, PASSWORD);
        Cookie accessTokenCookie = loginAndGetAccessTokenCookie(login, PASSWORD);

        mockMvc.perform(get("/auth/me")
                        .cookie(accessTokenCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(login))
                .andExpect(jsonPath("$.userId").exists())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void meRejectsAccessTokenFromAuthorizationHeader() throws Exception {
        String login = uniqueLogin();
        register(login, PASSWORD);
        Cookie accessTokenCookie = loginAndGetAccessTokenCookie(login, PASSWORD);

        mockMvc.perform(get("/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessTokenCookie.getValue()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meRejectsRefreshTokenInAccessTokenCookie() throws Exception {
        String login = uniqueLogin();
        register(login, PASSWORD);
        Cookie refreshTokenCookie = loginAndGetRefreshTokenCookie(login, PASSWORD);

        mockMvc.perform(get("/auth/me")
                        .cookie(new Cookie(AuthCookieService.ACCESS_TOKEN_COOKIE, refreshTokenCookie.getValue())))
                .andExpect(status().isUnauthorized());
    }
}
