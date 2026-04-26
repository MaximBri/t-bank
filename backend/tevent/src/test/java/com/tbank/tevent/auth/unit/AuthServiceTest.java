package com.tbank.tevent.auth.unit;

import com.tbank.tevent.auth.AuthService;
import com.tbank.tevent.auth.AuthTokens;
import com.tbank.tevent.auth.JwtService;
import com.tbank.tevent.auth.dto.LoginRequest;
import com.tbank.tevent.auth.dto.RegisterRequest;
import com.tbank.tevent.auth.exception.InvalidCredentialsException;
import com.tbank.tevent.auth.exception.UserAlreadyExistsException;
import com.tbank.tevent.user.User;
import com.tbank.tevent.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerEncodesPasswordAndSavesTrimmedUser() {
        RegisterRequest request = new RegisterRequest("  user  ", "password123", null);
        User savedUser = user("user", "encoded-password");

        when(userRepository.existsByLogin("user")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateAccessToken(savedUser)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(savedUser)).thenReturn("refresh-token");

        AuthTokens tokens = authService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getLogin()).isEqualTo("user");
        assertThat(userCaptor.getValue().getFullName()).isNull();
        assertThat(userCaptor.getValue().getPasswordHash()).isEqualTo("encoded-password");
        assertThat(tokens.accessToken()).isEqualTo("access-token");
        assertThat(tokens.refreshToken()).isEqualTo("refresh-token");
        assertThat(tokens.userId()).isEqualTo(savedUser.getId());
    }

    @Test
    void registerRejectsDuplicateLogin() {
        RegisterRequest request = new RegisterRequest("user", "password123", null);
        when(userRepository.existsByLogin("user")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessage("User with this login already exists");

        verifyNoInteractions(passwordEncoder, jwtService);
    }

    @Test
    void loginReturnsAccessAndRefreshTokens() {
        User user = user("user", "encoded-password");
        when(userRepository.findByLogin("user")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "encoded-password")).thenReturn(true);
        when(jwtService.generateAccessToken(user)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(user)).thenReturn("refresh-token");

        AuthTokens tokens = authService.login(new LoginRequest(" user ", "password123"));

        assertThat(tokens.accessToken()).isEqualTo("access-token");
        assertThat(tokens.refreshToken()).isEqualTo("refresh-token");
        assertThat(tokens.userId()).isEqualTo(user.getId());
    }

    @Test
    void loginRejectsUnknownUser() {
        when(userRepository.findByLogin("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest("missing", "password123")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid credentials");

        verifyNoInteractions(passwordEncoder, jwtService);
    }

    @Test
    void loginRejectsInvalidPassword() {
        User user = user("user", "encoded-password");
        when(userRepository.findByLogin("user")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "encoded-password")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("user", "wrong-password")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid credentials");

        verifyNoInteractions(jwtService);
    }

    @Test
    void refreshReturnsNewAccessTokenForValidRefreshToken() {
        User user = user("user", "encoded-password");
        when(jwtService.isRefreshToken("refresh-token")).thenReturn(true);
        when(jwtService.extractLogin("refresh-token")).thenReturn("user");
        when(userRepository.findByLogin("user")).thenReturn(Optional.of(user));
        when(jwtService.generateAccessToken(user)).thenReturn("new-access-token");

        assertThat(authService.refresh("refresh-token")).isEqualTo("new-access-token");
    }

    @Test
    void refreshRejectsInvalidRefreshToken() {
        when(jwtService.isRefreshToken("bad-token")).thenReturn(false);

        assertThatThrownBy(() -> authService.refresh("bad-token"))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid credentials");

        verifyNoInteractions(userRepository, passwordEncoder);
    }

    private User user(String login, String passwordHash) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setLogin(login);
        user.setPasswordHash(passwordHash);
        user.setFullName("Test User");
        return user;
    }

}
