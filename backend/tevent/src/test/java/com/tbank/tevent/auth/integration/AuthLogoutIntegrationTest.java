package com.tbank.tevent.auth.integration;

import com.tbank.tevent.auth.AuthCookieService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthLogoutIntegrationTest extends AbstractAuthIntegrationTest {

    @Test
    void logoutClearsRefreshTokenCookie() throws Exception {
        mockMvc.perform(post("/auth/logout"))
                .andExpect(status().isNoContent())
                .andExpect(result -> {
                    String setCookie = String.join("; ", result.getResponse().getHeaders(HttpHeaders.SET_COOKIE));
                    assertThat(setCookie)
                            .contains(AuthCookieService.ACCESS_TOKEN_COOKIE + "=")
                            .contains(AuthCookieService.REFRESH_TOKEN_COOKIE + "=")
                            .contains("Max-Age=0")
                            .contains("HttpOnly")
                            .contains("Path=/auth/refresh");
                });
    }
}
