package com.tbank.tevent.auth;

import com.tbank.tevent.auth.dto.CurrentUserResponse;
import com.tbank.tevent.auth.dto.LoginRequest;
import com.tbank.tevent.auth.dto.RegisterRequest;
import com.tbank.tevent.auth.exception.InvalidCredentialsException;
import com.tbank.tevent.auth.exception.UserAlreadyExistsException;
import com.tbank.tevent.repo.RefreshTokenRepository;
import com.tbank.tevent.repo.UserRepository;
import com.tbank.tevent.repo.entity.RefreshToken;
import com.tbank.tevent.repo.entity.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.digest.DigestUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public AuthTokens register(RegisterRequest request) {
        try {
            User user = User.builder()
                    .login(request.login().trim())
                    .firstName(request.firstName())
                    .lastName(request.lastName())
                    .passwordHash(passwordEncoder.encode(request.password()))
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            User savedUser = userRepository.saveAndFlush(user);
            return generateTokens(savedUser);

        } catch (DataIntegrityViolationException ex) {
            log.info("Registration failed: login already exists");
            throw new UserAlreadyExistsException();
        }
    }

    @Transactional
    public AuthTokens login(LoginRequest request) {
        String login = request.login().trim();
        User user = userRepository.findByLogin(login).orElseThrow(() -> {
            log.info("Login rejected: user not found, login={}", login);
            return new InvalidCredentialsException("Login rejected: user not found");
        });

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            log.info("Login rejected: invalid password, login={}", login);
            throw new InvalidCredentialsException("Login rejected: invalid password");
        }

        log.info("User logged in successfully, userId={}, login={}", user.getId(), user.getLogin());

        return generateTokens(user);
    }

    @Transactional
    public AuthTokens refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank() || !jwtService.isRefreshToken(refreshToken)) {
            log.info("Refresh rejected: missing or invalid refresh token");
            throw new InvalidCredentialsException("Refresh token is missing or not a valid refresh token");
        }

        String oldTokenHash = hashToken(refreshToken);
        RefreshToken oldTokenEntity = refreshTokenRepository.findByTokenHash(oldTokenHash)
                .orElseThrow(() -> {
                    log.info("Refresh rejected: token not found in storage");
                    return new InvalidCredentialsException("Refresh token not recognized");
                });

        if (oldTokenEntity.isRevoked()) {
            log.info("Refresh rejected: token already revoked");
            throw new InvalidCredentialsException("Refresh token has been revoked");
        }

        if (oldTokenEntity.getExpiryDate().isBefore(LocalDateTime.now())) {
            log.info("Refresh rejected: token expired at {}", oldTokenEntity.getExpiryDate());
            throw new InvalidCredentialsException("Refresh token expired");
        }

        String login = jwtService.extractLogin(refreshToken);
        User user = userRepository.findByLogin(login)
                .orElseThrow(() -> {
                    log.info("Refresh rejected: subject has no matching user, login={}", login);
                    return new InvalidCredentialsException("User from token not found");
                });

        if (!oldTokenEntity.getUserId().equals(user.getId())) {
            log.info("Refresh rejected: token user mismatch, expected={}, actual={}",
                    oldTokenEntity.getUserId(), user.getId());
            throw new InvalidCredentialsException("Token does not belong to the authenticated user");
        }

        refreshTokenRepository.delete(oldTokenEntity);
        log.info("Old refresh token revoked and deleted for user {}", user.getId());


        AuthTokens tokens = generateTokens(user);
        log.info("Access token refreshed successfully, userId={}, login={}", user.getId(), user.getLogin());
        return tokens;
    }

    @Transactional
    public CurrentUserResponse me(String login) {
        User user = userRepository.findByLogin(login)
                .orElseThrow(() -> {
                    log.info("Current session rejected: user not found, login={}", login);
                    return new InvalidCredentialsException("Current session rejected: user not found");
                });

        return new CurrentUserResponse(user.getLogin(), user.getId());
    }


    private String hashToken(String token) {
        return DigestUtils.sha256Hex(token);
    }

    private AuthTokens generateTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        RefreshToken newTokenEntity = RefreshToken.builder()
                .tokenHash(hashToken(refreshToken))
                .userId(user.getId())
                .expiryDate(jwtService.extractExpiration(refreshToken))
                .revoked(false)
                .build();

        refreshTokenRepository.save(newTokenEntity);
        return new AuthTokens(accessToken, refreshToken, user.getId());
    }
}
