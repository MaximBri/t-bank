package com.tbank.tevent.auth.integration;

import com.tbank.tevent.auth.AuthCookieService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthRefreshIntegrationTest extends AbstractAuthIntegrationTest {

    @Test
    void refreshRejectsMissingRefreshTokenCookie() throws Exception {
        mockMvc.perform(post("/auth/refresh"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Refresh token is missing"))
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void refreshReturnsNewAccessTokenForValidRefreshTokenCookie() throws Exception {
        String login = uniqueLogin();
        register(login, PASSWORD);
        Cookie refreshTokenCookie = loginAndGetRefreshTokenCookie(login, PASSWORD);

        mockMvc.perform(post("/auth/refresh")
                        .cookie(refreshTokenCookie))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString()).isEmpty())
                .andExpect(result -> {
                    String setCookie = result.getResponse().getHeader(HttpHeaders.SET_COOKIE);
                    assertThat(setCookie)
                            .contains(AuthCookieService.ACCESS_TOKEN_COOKIE + "=")
                            .contains("HttpOnly")
                            .contains("SameSite=Strict");
                });
    }

    @Test
    void refreshRejectsAccessTokenInRefreshCookie() throws Exception {
        String login = uniqueLogin();
        register(login, PASSWORD);
        Cookie accessTokenCookie = loginAndGetAccessTokenCookie(login, PASSWORD);

        mockMvc.perform(post("/auth/refresh")
                        .cookie(new Cookie(AuthCookieService.REFRESH_TOKEN_COOKIE, accessTokenCookie.getValue())))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid credentials"))
                .andExpect(jsonPath("$.status").value(401));
    }
}
