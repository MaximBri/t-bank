package com.tbank.tevent.auth;

import com.tbank.tevent.config.JwtProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@Slf4j
public class AuthCookieService {
    public static final String ACCESS_TOKEN_COOKIE = "accessToken";
    public static final String REFRESH_TOKEN_COOKIE = "refreshToken";

    private final JwtProperties jwtProperties;

    public AuthCookieService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    // Make cookie for access token
    public ResponseCookie createAccessTokenCookie(String accessToken) {
        log.debug("Creating access token cookie");
        return baseCookie(ACCESS_TOKEN_COOKIE)
                .value(accessToken)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofMinutes(jwtProperties.getAccessTokenExpirationMinutes()))
                .build();
    }

    // Make cookie for refresh token
    public ResponseCookie createRefreshTokenCookie(String refreshToken) {
        log.debug("Creating refresh token cookie");
        return baseCookie(REFRESH_TOKEN_COOKIE)
                .value(refreshToken)
                .sameSite("Strict")
                .path("/auth/refresh")
                .maxAge(Duration.ofDays(jwtProperties.getRefreshTokenExpirationDays()))
                .build();
    }

    // Clear access token cookie
    public ResponseCookie clearAccessTokenCookie() {
        log.debug("Clearing access token cookie");
        return baseCookie(ACCESS_TOKEN_COOKIE)
                .value("")
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ZERO)
                .build();
    }

    // Clear refresh token cookie
    public ResponseCookie clearRefreshTokenCookie() {
        log.debug("Clearing refresh token cookie");
        return baseCookie(REFRESH_TOKEN_COOKIE)
                .value("")
                .sameSite("Strict")
                .path("/auth/refresh")
                .maxAge(Duration.ZERO)
                .build();
    }

    // Base for cookies
    private ResponseCookie.ResponseCookieBuilder baseCookie(String name) {
        return ResponseCookie.from(name)
                .httpOnly(true)
                .secure(jwtProperties.isCookieSecure());
    }
}
