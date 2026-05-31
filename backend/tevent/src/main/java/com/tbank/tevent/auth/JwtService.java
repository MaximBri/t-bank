package com.tbank.tevent.auth;

import com.tbank.tevent.auth.exception.JwtConfigurationException;
import com.tbank.tevent.config.JwtProperties;
import com.tbank.tevent.repo.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
@Slf4j
public class JwtService {
    private static final String TOKEN_TYPE_CLAIM = "token_type";
    private static final String ACCESS_TOKEN_TYPE = "access";
    private static final String REFRESH_TOKEN_TYPE = "refresh";

    private final JwtProperties jwtProperties;
    private final SecretKey secretKey;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        if (jwtProperties.getSecret() == null || jwtProperties.getSecret().length() < 32) {
            throw new JwtConfigurationException("JWT secret must contain at least 32 characters");
        }
        if (jwtProperties.getAccessTokenExpirationMinutes() <= 0) {
            throw new JwtConfigurationException("JWT access token expiration must be positive");
        }
        if (jwtProperties.getRefreshTokenExpirationDays() <= 0) {
            throw new JwtConfigurationException("JWT refresh token expiration must be positive");
        }
        this.secretKey = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
        log.info("JWT service initialized successfully");
    }

    public String generateAccessToken(User user) {
        return generateToken(user, ACCESS_TOKEN_TYPE, jwtProperties.getAccessTokenExpirationMinutes() * 60);
    }

    public String generateRefreshToken(User user) {
        return generateToken(user, REFRESH_TOKEN_TYPE, jwtProperties.getRefreshTokenExpirationDays() * 24 * 60 * 60);
    }

    public String extractLogin(String token) { return extractAllClaims(token).getSubject(); }

    public boolean isAccessToken(String token) {
        return isTokenType(token, ACCESS_TOKEN_TYPE);
    }

    public boolean isRefreshToken(String token) {
        return isTokenType(token, REFRESH_TOKEN_TYPE);
    }

    private String generateToken(User user, String tokenType, long expiresInSeconds) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(expiresInSeconds);

        return Jwts.builder()
                .subject(user.getLogin())
                .claim(TOKEN_TYPE_CLAIM, tokenType)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(secretKey)
                .compact();
    }

    private boolean isTokenType(String token, String expectedTokenType) {
        try {
            Claims claims = extractAllClaims(token);
            return expectedTokenType.equals(claims.get(TOKEN_TYPE_CLAIM, String.class));
        } catch (Exception ex) {
            log.debug("Failed to validate token type: {}", ex.getMessage());
            return false;
        }
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public LocalDateTime extractExpiration(String token) {
        Date expiration = extractAllClaims(token).getExpiration();
        return expiration.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
    }
}
