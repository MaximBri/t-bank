package com.tbank.tevent.auth;

import com.tbank.tevent.config.JwtProperties;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class AuthCookieService {
    public static final String ACCESS_TOKEN_COOKIE = "accessToken";
    public static final String REFRESH_TOKEN_COOKIE = "refreshToken";

    private final JwtProperties jwtProperties;

    public AuthCookieService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    public ResponseCookie createAccessTokenCookie(String accessToken) {
        return ResponseCookie.from(ACCESS_TOKEN_COOKIE)
                .value(accessToken)
                .httpOnly(true)
                .secure(jwtProperties.isCookieSecure())
                .sameSite("Strict")
                .path("/")
                .maxAge(Duration.ofMinutes(jwtProperties.getAccessTokenExpirationMinutes()))
                .build();
    }

    public ResponseCookie createRefreshTokenCookie(String refreshToken) {
        return baseCookie()
                .value(refreshToken)
                .maxAge(Duration.ofDays(jwtProperties.getRefreshTokenExpirationDays()))
                .build();
    }

    public ResponseCookie clearRefreshTokenCookie() {
        return baseCookie()
                .value("")
                .maxAge(Duration.ZERO)
                .build();
    }

    public ResponseCookie clearAccessTokenCookie() {
        return ResponseCookie.from(ACCESS_TOKEN_COOKIE)
                .value("")
                .httpOnly(true)
                .secure(jwtProperties.isCookieSecure())
                .sameSite("Strict")
                .path("/")
                .maxAge(Duration.ZERO)
                .build();
    }

    private ResponseCookie.ResponseCookieBuilder baseCookie() {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE)
                .httpOnly(true)
                .secure(jwtProperties.isCookieSecure())
                .sameSite("Strict")
                .path("/auth/refresh");
    }
}
