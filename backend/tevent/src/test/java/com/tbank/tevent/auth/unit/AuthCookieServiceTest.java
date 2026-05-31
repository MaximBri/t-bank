package com.tbank.tevent.auth.unit;

import com.tbank.tevent.auth.AuthCookieService;
import com.tbank.tevent.config.JwtProperties;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

class AuthCookieServiceTest {

    @Test
    // Проверяет, что access cookie формируется с корректными security-атрибутами
    void createAccessTokenCookieBuildsExpectedCookie() {
        AuthCookieService service = new AuthCookieService(jwtProperties(true, 15, 30));

        ResponseCookie cookie = service.createAccessTokenCookie("access-token");

        assertThat(cookie.getName()).isEqualTo(AuthCookieService.ACCESS_TOKEN_COOKIE);
        assertThat(cookie.getValue()).isEqualTo("access-token");
        assertThat(cookie.getPath()).isEqualTo("/");
        assertThat(cookie.getMaxAge()).isEqualTo(Duration.ofMinutes(15));
        assertThat(cookie.getSameSite()).isEqualTo("Lax");
        assertThat(cookie.isHttpOnly()).isTrue();
        assertThat(cookie.isSecure()).isTrue();
    }

    @Test
    // Проверяет, что refresh cookie ограничена /auth/refresh и имеет Strict same-site
    void createRefreshTokenCookieBuildsExpectedCookie() {
        AuthCookieService service = new AuthCookieService(jwtProperties(true, 15, 30));

        ResponseCookie cookie = service.createRefreshTokenCookie("refresh-token");

        assertThat(cookie.getName()).isEqualTo(AuthCookieService.REFRESH_TOKEN_COOKIE);
        assertThat(cookie.getValue()).isEqualTo("refresh-token");
        assertThat(cookie.getPath()).isEqualTo("/auth/refresh");
        assertThat(cookie.getMaxAge()).isEqualTo(Duration.ofDays(30));
        assertThat(cookie.getSameSite()).isEqualTo("Strict");
        assertThat(cookie.isHttpOnly()).isTrue();
        assertThat(cookie.isSecure()).isTrue();
    }

    @Test
    // Проверка: очистка access cookie -> пустое значение и Max-Age=0
    void clearAccessTokenCookieBuildsExpiredCookie() {
        AuthCookieService service = new AuthCookieService(jwtProperties(false, 15, 30));

        ResponseCookie cookie = service.clearAccessTokenCookie();

        assertThat(cookie.getName()).isEqualTo(AuthCookieService.ACCESS_TOKEN_COOKIE);
        assertThat(cookie.getValue()).isEmpty();
        assertThat(cookie.getPath()).isEqualTo("/");
        assertThat(cookie.getMaxAge()).isZero();
        assertThat(cookie.getSameSite()).isEqualTo("Lax");
    }

    @Test
    // Проверка: очистка refresh cookie -> пустое значение и Max-Age=0
    void clearRefreshTokenCookieBuildsExpiredCookie() {
        AuthCookieService service = new AuthCookieService(jwtProperties(false, 15, 30));

        ResponseCookie cookie = service.clearRefreshTokenCookie();

        assertThat(cookie.getName()).isEqualTo(AuthCookieService.REFRESH_TOKEN_COOKIE);
        assertThat(cookie.getValue()).isEmpty();
        assertThat(cookie.getPath()).isEqualTo("/auth/refresh");
        assertThat(cookie.getMaxAge()).isZero();
        assertThat(cookie.getSameSite()).isEqualTo("Strict");
    }

    private JwtProperties jwtProperties(boolean cookieSecure, long accessMinutes, long refreshDays) {
        JwtProperties props = new JwtProperties();
        props.setSecret("test-secret-abcdefghijklmnopqrstuvwxyz123456");
        props.setCookieSecure(cookieSecure);
        props.setAccessTokenExpirationMinutes(accessMinutes);
        props.setRefreshTokenExpirationDays(refreshDays);
        return props;
    }
}
