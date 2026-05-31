package com.tbank.tevent.auth.unit;

import com.tbank.tevent.auth.JwtService;
import com.tbank.tevent.auth.exception.JwtConfigurationException;
import com.tbank.tevent.config.JwtProperties;
import com.tbank.tevent.repo.entity.User;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    @Test
    // Проверяет генерацию и валидацию access-token
    void generateAccessTokenProducesAccessTypeAndExpectedSubject() {
        JwtService jwtService = new JwtService(jwtProperties());
        User user = user("jwt_login");

        String accessToken = jwtService.generateAccessToken(user);

        assertThat(jwtService.extractLogin(accessToken)).isEqualTo("jwt_login");
        assertThat(jwtService.isAccessToken(accessToken)).isTrue();
        assertThat(jwtService.isRefreshToken(accessToken)).isFalse();
    }

    @Test
    // Проверяет генерацию и валидацию refresh-token
    void generateRefreshTokenProducesRefreshType() {
        JwtService jwtService = new JwtService(jwtProperties());
        User user = user("refresh_login");

        String refreshToken = jwtService.generateRefreshToken(user);

        assertThat(jwtService.extractLogin(refreshToken)).isEqualTo("refresh_login");
        assertThat(jwtService.isRefreshToken(refreshToken)).isTrue();
        assertThat(jwtService.isAccessToken(refreshToken)).isFalse();
    }

    @Test
    // Проверка: expiration извлекается и находится в будущем
    void extractExpirationReturnsFutureDate() {
        JwtService jwtService = new JwtService(jwtProperties());
        User user = user("exp_login");

        String accessToken = jwtService.generateAccessToken(user);
        LocalDateTime expiration = jwtService.extractExpiration(accessToken);

        assertThat(expiration).isAfter(LocalDateTime.now().minusSeconds(1));
    }

    @Test
    // Проверка: короткий секрет отклоняется
    void shortSecretThrowsJwtConfigurationException() {
        JwtProperties props = jwtProperties();
        props.setSecret("short-secret");

        assertThatThrownBy(() -> new JwtService(props))
                .isInstanceOf(JwtConfigurationException.class);
    }

    @Test
    // Проверка: access TTL > 0
    void nonPositiveAccessExpirationThrowsJwtConfigurationException() {
        JwtProperties props = jwtProperties();
        props.setAccessTokenExpirationMinutes(0);

        assertThatThrownBy(() -> new JwtService(props))
                .isInstanceOf(JwtConfigurationException.class);
    }

    @Test
    // Проверка: refresh TTL > 0
    void nonPositiveRefreshExpirationThrowsJwtConfigurationException() {
        JwtProperties props = jwtProperties();
        props.setRefreshTokenExpirationDays(0);

        assertThatThrownBy(() -> new JwtService(props))
                .isInstanceOf(JwtConfigurationException.class);
    }

    private JwtProperties jwtProperties() {
        JwtProperties props = new JwtProperties();
        props.setSecret("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
        props.setAccessTokenExpirationMinutes(15);
        props.setRefreshTokenExpirationDays(30);
        props.setCookieSecure(false);
        return props;
    }

    private User user(String login) {
        return User.builder()
                .id(UUID.randomUUID())
                .login(login)
                .passwordHash("hash")
                .build();
    }
}
