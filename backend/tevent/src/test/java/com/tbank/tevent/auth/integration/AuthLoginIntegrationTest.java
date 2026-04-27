package com.tbank.tevent.auth.integration;

import com.tbank.tevent.auth.AuthCookieService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthLoginIntegrationTest extends AbstractAuthIntegrationTest {

    @Test
    void loginSetsTokenCookiesWithoutTokenResponseBody() throws Exception {
        String login = uniqueLogin();
        register(login, PASSWORD);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson(login, PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString()).isEmpty())
                .andExpect(result -> {
                    String setCookie = String.join("; ", result.getResponse().getHeaders(HttpHeaders.SET_COOKIE));
                    assertThat(setCookie)
                            .contains(AuthCookieService.ACCESS_TOKEN_COOKIE + "=")
                            .contains(AuthCookieService.REFRESH_TOKEN_COOKIE + "=")
                            .contains("Path=/auth/refresh")
                            .contains("HttpOnly")
                            .contains("SameSite=Strict");
                });
    }

    @Test
    void loginRejectsInvalidPassword() throws Exception {
        String login = uniqueLogin();
        register(login, PASSWORD);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson(login, "wrong-password")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid credentials"))
                .andExpect(jsonPath("$.status").value(401));
    }
}
