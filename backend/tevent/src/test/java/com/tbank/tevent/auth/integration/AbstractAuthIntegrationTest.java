package com.tbank.tevent.auth.integration;

import com.tbank.tevent.auth.AuthCookieService;
import jakarta.servlet.http.Cookie;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("test")
@AutoConfigureMockMvc
@SpringBootTest
abstract class AbstractAuthIntegrationTest {

    protected static final String PASSWORD = "password123";

    @Autowired
    protected MockMvc mockMvc;

    protected void register(String login, String password) throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson(login, password)))
                .andExpect(status().isCreated());
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
                  "username": "%s",
                  "password": "%s"
                }
                """.formatted(login, password);
    }

    protected String loginJson(String login, String password) {
        return """
                {
                  "username": "%s",
                  "password": "%s"
                }
                """.formatted(login, password);
    }

    protected String uniqueLogin() {
        return "user-" + UUID.randomUUID();
    }
}
