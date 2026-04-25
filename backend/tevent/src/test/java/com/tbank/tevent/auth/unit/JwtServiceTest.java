package com.tbank.tevent.auth.unit;

import com.tbank.tevent.auth.JwtService;
import com.tbank.tevent.config.JwtProperties;
import com.tbank.tevent.user.User;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    @Test
    void generateAccessTokenCreatesOnlyAccessToken() {
        JwtService jwtService = new JwtService(jwtProperties());
        String token = jwtService.generateAccessToken(user());

        assertThat(jwtService.isAccessToken(token)).isTrue();
        assertThat(jwtService.isRefreshToken(token)).isFalse();
        assertThat(jwtService.extractLogin(token)).isEqualTo("user");
    }

    @Test
    void generateRefreshTokenCreatesOnlyRefreshToken() {
        JwtService jwtService = new JwtService(jwtProperties());
        String token = jwtService.generateRefreshToken(user());

        assertThat(jwtService.isRefreshToken(token)).isTrue();
        assertThat(jwtService.isAccessToken(token)).isFalse();
        assertThat(jwtService.extractLogin(token)).isEqualTo("user");
    }

    @Test
    void rejectsTooShortSecret() {
        JwtProperties properties = jwtProperties();
        properties.setSecret("short");

        assertThatThrownBy(() -> new JwtService(properties))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("JWT secret must contain at least 32 characters");
    }

    @Test
    void rejectsNonPositiveAccessTokenExpiration() {
        JwtProperties properties = jwtProperties();
        properties.setAccessTokenExpirationMinutes(0);

        assertThatThrownBy(() -> new JwtService(properties))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("JWT access token expiration must be positive");
    }

    @Test
    void rejectsNonPositiveRefreshTokenExpiration() {
        JwtProperties properties = jwtProperties();
        properties.setRefreshTokenExpirationDays(0);

        assertThatThrownBy(() -> new JwtService(properties))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("JWT refresh token expiration must be positive");
    }

    @Test
    void rejectsMalformedToken() {
        JwtService jwtService = new JwtService(jwtProperties());

        assertThat(jwtService.isAccessToken("not-a-jwt")).isFalse();
        assertThat(jwtService.isRefreshToken("not-a-jwt")).isFalse();
    }

    private JwtProperties jwtProperties() {
        JwtProperties properties = new JwtProperties();
        properties.setSecret("tevent-unit-jwt-secret-for-auth-tests");
        properties.setAccessTokenExpirationMinutes(15);
        properties.setRefreshTokenExpirationDays(30);
        return properties;
    }

    private User user() {
        User user = new User();
        user.setLogin("user");
        return user;
    }
}
