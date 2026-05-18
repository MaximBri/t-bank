package com.tbank.tevent.auth.integration;

import com.tbank.tevent.auth.AuthCookieService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthRegisterIntegrationTest extends AbstractAuthIntegrationTest {

    @Test
    void registerCreatesUserWithoutPasswordHash() throws Exception {
        String login = uniqueLogin();

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson(login, PASSWORD)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").exists())
                .andExpect(jsonPath("$.joinedGroupId").isEmpty())
                .andExpect(jsonPath("$.accessToken").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void registerSetsTokenCookies() throws Exception {
        String login = uniqueLogin();

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson(login, PASSWORD)))
                .andExpect(status().isCreated())
                .andExpect(result -> {
                    String setCookie = String.join("; ", result.getResponse().getHeaders(HttpHeaders.SET_COOKIE));
                    assertThat(setCookie)
                            .contains(AuthCookieService.ACCESS_TOKEN_COOKIE + "=")
                            .contains(AuthCookieService.REFRESH_TOKEN_COOKIE + "=")
                            .contains("HttpOnly")
                            .contains("SameSite=Strict");
                });
    }

    @Test
    void registerRejectsDuplicateLogin() throws Exception {
        String login = uniqueLogin();
        register(login, PASSWORD);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson(login, PASSWORD)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("User with this login already exists"))
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void registerRejectsBlankUsername() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson(" ", PASSWORD)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void registerRejectsShortPassword() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson(uniqueLogin(), "short")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }
}
