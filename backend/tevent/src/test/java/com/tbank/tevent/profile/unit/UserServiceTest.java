package com.tbank.tevent.profile.unit;

import com.tbank.tevent.profile.UserService;
import com.tbank.tevent.profile.dto.PasswordChangeRequest;
import com.tbank.tevent.profile.dto.UpdateProfileRequest;
import com.tbank.tevent.profile.dto.UserProfileDto;
import com.tbank.tevent.repo.UserRepository;
import com.tbank.tevent.repo.entity.User;
import com.tbank.tevent.s3.S3Service;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private S3Service s3Service;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder, s3Service);
    }

    @Test
    // Проверка: updateUserPassword возвращает 404, если пользователь не найден
    void updateUserPasswordThrowsNotFoundWhenUserMissing() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateUserPassword(userId, new PasswordChangeRequest("Current123", "NewPass123")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException rs = (ResponseStatusException) ex;
                    assertThat(rs.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                    assertThat(rs.getReason()).isEqualTo("User not found");
                });
    }

    @Test
    // Проверка: updateUserPassword возвращает 400 при неверном текущем пароле
    void updateUserPasswordRejectsWrongCurrentPassword() {
        UUID userId = UUID.randomUUID();
        User user = existingUser(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Wrong123", user.getPasswordHash())).thenReturn(false);

        assertThatThrownBy(() -> userService.updateUserPassword(userId, new PasswordChangeRequest("Wrong123", "NewPass123")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException rs = (ResponseStatusException) ex;
                    assertThat(rs.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(rs.getReason()).isEqualTo("Incorrect current password");
                });

        verify(userRepository, never()).save(user);
    }

    @Test
    // Проверка: updateUserPassword возвращает 400, если новый пароль совпадает с текущим
    void updateUserPasswordRejectsSamePassword() {
        UUID userId = UUID.randomUUID();
        User user = existingUser(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Current123", user.getPasswordHash())).thenReturn(true);
        when(passwordEncoder.matches("Current123", user.getPasswordHash())).thenReturn(true);

        assertThatThrownBy(() -> userService.updateUserPassword(userId, new PasswordChangeRequest("Current123", "Current123")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException rs = (ResponseStatusException) ex;
                    assertThat(rs.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(rs.getReason()).isEqualTo("The new password must be different from the current one");
                });

        verify(userRepository, never()).save(user);
    }

    @Test
    // Проверка: updateUserPassword обновляет hash и сохраняет пользователя
    void updateUserPasswordUpdatesHashAndSavesUser() {
        UUID userId = UUID.randomUUID();
        User user = existingUser(userId);
        LocalDateTime before = user.getUpdatedAt();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Current123", user.getPasswordHash())).thenReturn(true);
        when(passwordEncoder.matches("NewPass123", user.getPasswordHash())).thenReturn(false);
        when(passwordEncoder.encode("NewPass123")).thenReturn("encoded-new");

        userService.updateUserPassword(userId, new PasswordChangeRequest("Current123", "NewPass123"));

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User saved = userCaptor.getValue();
        assertThat(saved.getPasswordHash()).isEqualTo("encoded-new");
        assertThat(saved.getUpdatedAt()).isAfterOrEqualTo(before);
    }

    @Test
    // Проверка: updateUser возвращает 404, если пользователь не найден
    void updateUserThrowsNotFoundWhenUserMissing() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateUser(userId, new UpdateProfileRequest("A", "B", null, null)))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException rs = (ResponseStatusException) ex;
                    assertThat(rs.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                    assertThat(rs.getReason()).isEqualTo("User not found");
                });
    }

    @Test
    // Проверка: updateUser возвращает 409, если новый логин уже занят
    void updateUserRejectsDuplicateLogin() {
        UUID userId = UUID.randomUUID();
        User current = existingUser(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(current));
        when(userRepository.findByLogin("occupied")).thenReturn(Optional.of(existingUser(UUID.randomUUID())));

        assertThatThrownBy(() -> userService.updateUser(userId, new UpdateProfileRequest(null, null, null, "occupied")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException rs = (ResponseStatusException) ex;
                    assertThat(rs.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(rs.getReason()).isEqualTo("Логин уже используется");
                });

        verify(userRepository, never()).save(current);
    }

    @Test
    // Проверка: updateUser обновляет login/name/avatar и вызывает useKey для avatar
    void updateUserUpdatesProfileFieldsAndUsesAvatarKey() {
        UUID userId = UUID.randomUUID();
        User current = existingUser(userId);

        UpdateProfileRequest request = new UpdateProfileRequest(
                "NewFirst",
                "NewSecond",
                "receipts/u/new-avatar.png",
                "new_login"
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(current));
        when(userRepository.findByLogin("new_login")).thenReturn(Optional.empty());

        UserProfileDto result = userService.updateUser(userId, request);

        verify(s3Service).useKey("receipts/u/new-avatar.png");
        verify(userRepository).save(current);
        assertThat(current.getLogin()).isEqualTo("new_login");
        assertThat(current.getFirstName()).isEqualTo("NewFirst");
        assertThat(current.getSecondName()).isEqualTo("NewSecond");
        assertThat(current.getAvatarUrl()).isEqualTo("receipts/u/new-avatar.png");

        assertThat(result.login()).isEqualTo("new_login");
        assertThat(result.firstName()).isEqualTo("NewFirst");
        assertThat(result.secondName()).isEqualTo("NewSecond");
        assertThat(result.avatarUrl()).isEqualTo("receipts/u/new-avatar.png");
    }

    @Test
    // Проверка: updateUser игнорирует null/blank поля и не вызывает useKey
    void updateUserIgnoresBlankFields() {
        UUID userId = UUID.randomUUID();
        User current = existingUser(userId);
        String oldLogin = current.getLogin();
        String oldFirst = current.getFirstName();
        String oldSecond = current.getSecondName();
        String oldAvatar = current.getAvatarUrl();

        UpdateProfileRequest request = new UpdateProfileRequest("   ", "", "   ", " ");

        when(userRepository.findById(userId)).thenReturn(Optional.of(current));

        UserProfileDto result = userService.updateUser(userId, request);

        verify(s3Service, never()).useKey(org.mockito.ArgumentMatchers.anyString());
        verify(userRepository).save(current);

        assertThat(current.getLogin()).isEqualTo(oldLogin);
        assertThat(current.getFirstName()).isEqualTo(oldFirst);
        assertThat(current.getSecondName()).isEqualTo(oldSecond);
        assertThat(current.getAvatarUrl()).isEqualTo(oldAvatar);

        assertThat(result.login()).isEqualTo(oldLogin);
        assertThat(result.firstName()).isEqualTo(oldFirst);
        assertThat(result.secondName()).isEqualTo(oldSecond);
        assertThat(result.avatarUrl()).isEqualTo(oldAvatar);
    }

    private User existingUser(UUID id) {
        LocalDateTime now = LocalDateTime.now();
        return User.builder()
                .id(id)
                .login("current_login")
                .passwordHash("stored-hash")
                .firstName("First")
                .secondName("Second")
                .avatarUrl("receipts/u/old.png")
                .createdAt(now.minusDays(2))
                .updatedAt(now.minusDays(1))
                .build();
    }
}
