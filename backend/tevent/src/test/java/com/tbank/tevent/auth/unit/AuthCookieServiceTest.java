package com.tbank.tevent.auth.unit;

import com.tbank.tevent.auth.AuthCookieService;
import com.tbank.tevent.config.JwtProperties;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

class AuthCookieServiceTest {

    @Test
    void createAccessTokenCookieUsesAccessTokenSettings() {
        AuthCookieService service = new AuthCookieService(jwtProperties(false));

        ResponseCookie cookie = service.createAccessTokenCookie("access-token");

        assertThat(cookie.getName()).isEqualTo(AuthCookieService.ACCESS_TOKEN_COOKIE);
        assertThat(cookie.getValue()).isEqualTo("access-token");
        assertThat(cookie.isHttpOnly()).isTrue();
        assertThat(cookie.isSecure()).isFalse();
        assertThat(cookie.getSameSite()).isEqualTo("Strict");
        assertThat(cookie.getPath()).isEqualTo("/");
        assertThat(cookie.getMaxAge()).isEqualTo(Duration.ofMinutes(15));
    }

    @Test
    void createRefreshTokenCookieUsesRefreshTokenSettings() {
        AuthCookieService service = new AuthCookieService(jwtProperties(true));

        ResponseCookie cookie = service.createRefreshTokenCookie("refresh-token");

        assertThat(cookie.getName()).isEqualTo(AuthCookieService.REFRESH_TOKEN_COOKIE);
        assertThat(cookie.getValue()).isEqualTo("refresh-token");
        assertThat(cookie.isHttpOnly()).isTrue();
        assertThat(cookie.isSecure()).isTrue();
        assertThat(cookie.getSameSite()).isEqualTo("Strict");
        assertThat(cookie.getPath()).isEqualTo("/auth/refresh");
        assertThat(cookie.getMaxAge()).isEqualTo(Duration.ofDays(30));
    }

    @Test
    void clearAccessTokenCookieExpiresAccessCookie() {
        AuthCookieService service = new AuthCookieService(jwtProperties(false));

        ResponseCookie cookie = service.clearAccessTokenCookie();

        assertThat(cookie.getName()).isEqualTo(AuthCookieService.ACCESS_TOKEN_COOKIE);
        assertThat(cookie.getValue()).isEmpty();
        assertThat(cookie.isHttpOnly()).isTrue();
        assertThat(cookie.getSameSite()).isEqualTo("Strict");
        assertThat(cookie.getPath()).isEqualTo("/");
        assertThat(cookie.getMaxAge()).isEqualTo(Duration.ZERO);
    }

    @Test
    void clearRefreshTokenCookieExpiresRefreshCookie() {
        AuthCookieService service = new AuthCookieService(jwtProperties(false));

        ResponseCookie cookie = service.clearRefreshTokenCookie();

        assertThat(cookie.getName()).isEqualTo(AuthCookieService.REFRESH_TOKEN_COOKIE);
        assertThat(cookie.getValue()).isEmpty();
        assertThat(cookie.isHttpOnly()).isTrue();
        assertThat(cookie.getSameSite()).isEqualTo("Strict");
        assertThat(cookie.getPath()).isEqualTo("/auth/refresh");
        assertThat(cookie.getMaxAge()).isEqualTo(Duration.ZERO);
    }

    private JwtProperties jwtProperties(boolean secureCookie) {
        JwtProperties properties = new JwtProperties();
        properties.setAccessTokenExpirationMinutes(15);
        properties.setRefreshTokenExpirationDays(30);
        properties.setCookieSecure(secureCookie);
        return properties;
    }
}
