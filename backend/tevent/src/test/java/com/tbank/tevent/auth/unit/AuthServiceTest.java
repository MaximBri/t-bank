package com.tbank.tevent.auth.unit;

import com.tbank.tevent.auth.AuthService;
import com.tbank.tevent.auth.AuthTokens;
import com.tbank.tevent.auth.JwtService;
import com.tbank.tevent.auth.dto.LoginRequest;
import com.tbank.tevent.auth.dto.RegisterRequest;
import com.tbank.tevent.auth.exception.InvalidCredentialsException;
import com.tbank.tevent.auth.exception.UserAlreadyExistsException;
import com.tbank.tevent.invitations.InviteService;
import com.tbank.tevent.repo.RefreshTokenRepository;
import com.tbank.tevent.repo.UserRepository;
import com.tbank.tevent.repo.entity.RefreshToken;
import com.tbank.tevent.repo.entity.User;
import org.apache.commons.codec.digest.DigestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private InviteService inviteService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                passwordEncoder,
                jwtService,
                refreshTokenRepository,
                inviteService
        );
    }

    @Test
        // Проверка: успешная регистрация возвращает пару токенов и сохраняет refresh-token в storage
    void registerCreatesUserAndStoresRefreshHash() {
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        RegisterRequest request = new RegisterRequest("  test_login  ", "StrongPass123", "Test", "User", "invite-1");

        User savedUser = User.builder()
                .id(userId)
                .login("test_login")
                .passwordHash("encoded")
                .build();

        when(passwordEncoder.encode("StrongPass123")).thenReturn("encoded");
        when(userRepository.saveAndFlush(any(User.class))).thenReturn(savedUser);
        when(inviteService.applyToken(savedUser, "invite-1")).thenReturn(eventId);
        when(jwtService.generateAccessToken(savedUser)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(savedUser)).thenReturn("refresh-token");
        when(jwtService.extractExpiration("refresh-token")).thenReturn(LocalDateTime.now().plusDays(7));

        AuthService.RegisterResult registerResult = authService.register(request);
        AuthTokens tokens = registerResult.tokens();

        assertThat(tokens.userId()).isEqualTo(userId);
        assertThat(tokens.accessToken()).isEqualTo("access-token");
        assertThat(tokens.refreshToken()).isEqualTo("refresh-token");
        assertThat(registerResult.joinedGroupId()).isEqualTo(eventId);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).saveAndFlush(userCaptor.capture());
        assertThat(userCaptor.getValue().getLogin()).isEqualTo("test_login");

        ArgumentCaptor<RefreshToken> refreshCaptor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(refreshCaptor.capture());
        assertThat(refreshCaptor.getValue().getTokenHash()).isEqualTo(DigestUtils.sha256Hex("refresh-token"));
    }

    @Test
    // Проверка: duplicate login при регистрации -> UserAlreadyExistsException
    void registerThrowsConflictWhenLoginExists() {
        RegisterRequest request = new RegisterRequest("dup", "StrongPass123", null, null, null);

        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.saveAndFlush(any(User.class))).thenThrow(new DataIntegrityViolationException("dup"));

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(UserAlreadyExistsException.class);
    }

    @Test
    // Проверка: неверный пароль -> логин отклоняется
    void loginThrowsWhenPasswordDoesNotMatch() {
        User user = User.builder().id(UUID.randomUUID()).login("user").passwordHash("stored-hash").build();
        when(userRepository.findByLogin("user")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("bad", "stored-hash")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("user", null, "bad")))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    // Проверка: пользователь не найден -> логин отклоняется
    void loginThrowsWhenUserNotFound() {
        when(userRepository.findByLogin("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest("missing", null, "StrongPass123")))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    // Проверка: успешный логин возвращает пару токенов и сохраняет refresh-token в storage
    void loginReturnsTokenPairAndStoresRefreshHash() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .login("user")
                .passwordHash("stored-hash")
                .build();

        LocalDateTime refreshExpiry = LocalDateTime.now().plusDays(7);

        when(userRepository.findByLogin("user")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("StrongPass123", "stored-hash")).thenReturn(true);
        when(jwtService.generateAccessToken(user)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(user)).thenReturn("refresh-token");
        when(jwtService.extractExpiration("refresh-token")).thenReturn(refreshExpiry);

        AuthTokens tokens = authService.login(new LoginRequest("  user  ", null, "StrongPass123"));

        assertThat(tokens.userId()).isEqualTo(userId);
        assertThat(tokens.accessToken()).isEqualTo("access-token");
        assertThat(tokens.refreshToken()).isEqualTo("refresh-token");

        ArgumentCaptor<RefreshToken> refreshCaptor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(refreshCaptor.capture());
        RefreshToken savedRefresh = refreshCaptor.getValue();
        assertThat(savedRefresh.getUserId()).isEqualTo(userId);
        assertThat(savedRefresh.getTokenHash()).isEqualTo(DigestUtils.sha256Hex("refresh-token"));
        assertThat(savedRefresh.getExpiryDate()).isEqualTo(refreshExpiry);
    }

    @Test
    // Проверка: успешный refresh -> старый refresh удаляется и выдается новая пара токенов
    void refreshRotatesTokenPair() {
        UUID userId = UUID.randomUUID();
        String oldRefresh = "old-refresh";

        RefreshToken oldToken = RefreshToken.builder()
                .userId(userId)
                .tokenHash(DigestUtils.sha256Hex(oldRefresh))
                .expiryDate(LocalDateTime.now().plusDays(1))
                .build();

        User user = User.builder().id(userId).login("refresh_user").passwordHash("hash").build();

        when(jwtService.isRefreshToken(oldRefresh)).thenReturn(true);
        when(refreshTokenRepository.findByTokenHash(DigestUtils.sha256Hex(oldRefresh))).thenReturn(Optional.of(oldToken));
        when(jwtService.extractLogin(oldRefresh)).thenReturn("refresh_user");
        when(userRepository.findByLogin("refresh_user")).thenReturn(Optional.of(user));
        when(jwtService.generateAccessToken(user)).thenReturn("new-access");
        when(jwtService.generateRefreshToken(user)).thenReturn("new-refresh");
        when(jwtService.extractExpiration("new-refresh")).thenReturn(LocalDateTime.now().plusDays(7));

        AuthTokens tokens = authService.refresh(oldRefresh);

        assertThat(tokens.userId()).isEqualTo(userId);
        assertThat(tokens.accessToken()).isEqualTo("new-access");
        assertThat(tokens.refreshToken()).isEqualTo("new-refresh");
        verify(refreshTokenRepository).delete(oldToken);
        verify(refreshTokenRepository, atLeastOnce()).save(any(RefreshToken.class));
    }

    @Test
    // Проверка: токен не refresh-типа -> отклонение refresh
    void refreshRejectsInvalidTokenType() {
        when(jwtService.isRefreshToken("not-refresh")).thenReturn(false);

        assertThatThrownBy(() -> authService.refresh("not-refresh"))
                .isInstanceOf(InvalidCredentialsException.class);

        verify(refreshTokenRepository, never()).findByTokenHash(any());
    }

    @Test
    // Проверка: токен не найден в хранилище -> отклонение refresh
    void refreshRejectsWhenTokenNotFound() {
        String refresh = "missing-refresh";
        when(jwtService.isRefreshToken(refresh)).thenReturn(true);
        when(refreshTokenRepository.findByTokenHash(DigestUtils.sha256Hex(refresh))).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.refresh(refresh))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    // Проверка: токен просрочен -> отклонение refresh
    void refreshRejectsExpiredToken() {
        UUID userId = UUID.randomUUID();
        String refresh = "expired-refresh";
        RefreshToken token = RefreshToken.builder()
                .userId(userId)
                .tokenHash(DigestUtils.sha256Hex(refresh))
                .expiryDate(LocalDateTime.now().minusMinutes(1))
                .build();

        when(jwtService.isRefreshToken(refresh)).thenReturn(true);
        when(refreshTokenRepository.findByTokenHash(DigestUtils.sha256Hex(refresh))).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> authService.refresh(refresh))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    // Проверка: пользователь из subject не найден -> отклонение refresh
    void refreshRejectsWhenSubjectUserNotFound() {
        UUID userId = UUID.randomUUID();
        String refresh = "refresh-user-missing";
        RefreshToken token = RefreshToken.builder()
                .userId(userId)
                .tokenHash(DigestUtils.sha256Hex(refresh))
                .expiryDate(LocalDateTime.now().plusDays(1))
                .build();

        when(jwtService.isRefreshToken(refresh)).thenReturn(true);
        when(refreshTokenRepository.findByTokenHash(DigestUtils.sha256Hex(refresh))).thenReturn(Optional.of(token));
        when(jwtService.extractLogin(refresh)).thenReturn("missing_user");
        when(userRepository.findByLogin("missing_user")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.refresh(refresh))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    // Проверка: несоответствии userId токена и найденного пользователя -> отклонение refresh
    void refreshRejectsWhenTokenUserMismatch() {
        UUID tokenUserId = UUID.randomUUID();
        UUID actualUserId = UUID.randomUUID();
        String refresh = "refresh-mismatch";

        RefreshToken token = RefreshToken.builder()
                .userId(tokenUserId)
                .tokenHash(DigestUtils.sha256Hex(refresh))
                .expiryDate(LocalDateTime.now().plusDays(1))
                .build();

        User user = User.builder().id(actualUserId).login("user").passwordHash("hash").build();

        when(jwtService.isRefreshToken(refresh)).thenReturn(true);
        when(refreshTokenRepository.findByTokenHash(DigestUtils.sha256Hex(refresh))).thenReturn(Optional.of(token));
        when(jwtService.extractLogin(refresh)).thenReturn("user");
        when(userRepository.findByLogin("user")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.refresh(refresh))
                .isInstanceOf(InvalidCredentialsException.class);
    }
}
