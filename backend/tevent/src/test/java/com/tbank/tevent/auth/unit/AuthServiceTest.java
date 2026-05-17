package com.tbank.tevent.auth.unit;

import com.tbank.tevent.auth.AuthService;
import com.tbank.tevent.auth.AuthTokens;
import com.tbank.tevent.auth.JwtService;
import com.tbank.tevent.auth.dto.CurrentUserResponse;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
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
import static org.mockito.Mockito.*;

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

    @InjectMocks
    private AuthService authService;

    @Test
    void registerEncodesPasswordAndSavesTrimmedUser() {
        RegisterRequest request = new RegisterRequest("  user  ", "password123", null, null, null);
        User savedUser = user("user", "encoded-password");
        LocalDateTime refreshExpiry = LocalDateTime.now().plusDays(30);

        when(passwordEncoder.encode("password123")).thenReturn("encoded-password");
        when(userRepository.saveAndFlush(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateAccessToken(savedUser)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(savedUser)).thenReturn("refresh-token");
        when(jwtService.extractExpiration("refresh-token")).thenReturn(refreshExpiry);

        AuthTokens tokens = authService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).saveAndFlush(userCaptor.capture());
        assertThat(userCaptor.getValue().getLogin()).isEqualTo("user");
        assertThat(userCaptor.getValue().getPasswordHash()).isEqualTo("encoded-password");

        ArgumentCaptor<RefreshToken> refreshTokenCaptor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(refreshTokenCaptor.capture());
        assertThat(refreshTokenCaptor.getValue().getUserId()).isEqualTo(savedUser.getId());
        assertThat(refreshTokenCaptor.getValue().getExpiryDate()).isEqualTo(refreshExpiry);
        assertThat(refreshTokenCaptor.getValue().getTokenHash()).isEqualTo(DigestUtils.sha256Hex("refresh-token"));

        assertThat(tokens.accessToken()).isEqualTo("access-token");
        assertThat(tokens.refreshToken()).isEqualTo("refresh-token");
        assertThat(tokens.userId()).isEqualTo(savedUser.getId());
        verifyNoInteractions(inviteService);
    }

    @Test
    void registerRejectsDuplicateLogin() {
        RegisterRequest request = new RegisterRequest("user", "password123", null, null, null);
        when(passwordEncoder.encode("password123")).thenReturn("encoded-password");
        when(userRepository.saveAndFlush(any(User.class))).thenThrow(DataIntegrityViolationException.class);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessage("User with this login already exists");

        verify(jwtService, never()).generateAccessToken(any());
        verify(refreshTokenRepository, never()).save(any());
    }

    @Test
    void loginReturnsAccessAndRefreshTokens() {
        User user = user("user", "encoded-password");
        LocalDateTime refreshExpiry = LocalDateTime.now().plusDays(30);

        when(userRepository.findByLogin("user")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "encoded-password")).thenReturn(true);
        when(jwtService.generateAccessToken(user)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(user)).thenReturn("refresh-token");
        when(jwtService.extractExpiration("refresh-token")).thenReturn(refreshExpiry);

        AuthTokens tokens = authService.login(new LoginRequest(" user ", null, "password123"));

        assertThat(tokens.accessToken()).isEqualTo("access-token");
        assertThat(tokens.refreshToken()).isEqualTo("refresh-token");
        assertThat(tokens.userId()).isEqualTo(user.getId());
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void loginRejectsUnknownUser() {
        when(userRepository.findByLogin("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest("missing", null, "password123")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Login rejected: user not found");

        verifyNoInteractions(passwordEncoder, jwtService, refreshTokenRepository);
    }

    @Test
    void loginRejectsInvalidPassword() {
        User user = user("user", "encoded-password");
        when(userRepository.findByLogin("user")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "encoded-password")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("user", null, "wrong-password")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Login rejected: invalid password");

        verifyNoInteractions(jwtService, refreshTokenRepository);
    }

    @Test
    void refreshReturnsNewAccessAndRefreshTokensForValidRefreshToken() {
        User user = user("user", "encoded-password");
        String refreshToken = "refresh-token";
        LocalDateTime refreshExpiry = LocalDateTime.now().plusDays(30);
        RefreshToken storedToken = RefreshToken.builder()
                .tokenHash(DigestUtils.sha256Hex(refreshToken))
                .userId(user.getId())
                .expiryDate(LocalDateTime.now().plusHours(1))
                .revoked(false)
                .build();

        when(jwtService.isRefreshToken(refreshToken)).thenReturn(true);
        when(refreshTokenRepository.findByTokenHash(DigestUtils.sha256Hex(refreshToken)))
                .thenReturn(Optional.of(storedToken));
        when(jwtService.extractLogin(refreshToken)).thenReturn("user");
        when(userRepository.findByLogin("user")).thenReturn(Optional.of(user));
        when(jwtService.generateAccessToken(user)).thenReturn("new-access-token");
        when(jwtService.generateRefreshToken(user)).thenReturn("new-refresh-token");
        when(jwtService.extractExpiration("new-refresh-token")).thenReturn(refreshExpiry);

        AuthTokens tokens = authService.refresh(refreshToken);

        assertThat(tokens.accessToken()).isEqualTo("new-access-token");
        assertThat(tokens.refreshToken()).isEqualTo("new-refresh-token");
        assertThat(tokens.userId()).isEqualTo(user.getId());
        verify(refreshTokenRepository).delete(storedToken);
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void refreshRejectsInvalidRefreshToken() {
        when(jwtService.isRefreshToken("bad-token")).thenReturn(false);

        assertThatThrownBy(() -> authService.refresh("bad-token"))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Refresh token is missing or not a valid refresh token");

        verifyNoInteractions(userRepository, passwordEncoder);
    }

    @Test
    void meReturnsCurrentUserWithProfileFields() {
        User user = user("user", "encoded-password");
        user.setFirstName("Ivan");
        user.setSecondName("Ivanov");
        user.setAvatarUrl("https://cdn.example/avatar.png");

        when(userRepository.findByLogin("user")).thenReturn(Optional.of(user));

        CurrentUserResponse response = authService.me("user");

        assertThat(response.login()).isEqualTo("user");
        assertThat(response.userId()).isEqualTo(user.getId());
        assertThat(response.firstName()).isEqualTo("Ivan");
        assertThat(response.secondName()).isEqualTo("Ivanov");
        assertThat(response.avatarUrl()).isEqualTo("https://cdn.example/avatar.png");
    }

    private User user(String login, String passwordHash) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setLogin(login);
        user.setPasswordHash(passwordHash);
        return user;
    }
}
