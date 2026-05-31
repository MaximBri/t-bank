package com.tbank.tevent.profile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tbank.tevent.exception.GlobalExceptionHandler;
import com.tbank.tevent.profile.dto.PasswordChangeRequest;
import com.tbank.tevent.profile.dto.UpdateProfileRequest;
import com.tbank.tevent.profile.dto.UserProfileDto;
import com.tbank.tevent.repo.entity.User;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ProfileIntegrationTest {

    @Mock
    private UserService userService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        UserController controller = new UserController(userService);
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @AfterEach
    void clearSecurity() {
        SecurityContextHolder.clearContext();
    }

    private void authenticate(UUID userId) {
        User principal = User.builder().id(userId).build();
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, java.util.List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    // Проверка: обновление профиля без авторизации -> 401
    void updateProfileWithoutAuthReturnsUnauthorized() throws Exception {
        String payload = objectMapper.writeValueAsString(Map.of("first_name", "Alex"));

        mockMvc.perform(patch("/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("User is not authenticated"));

        verifyNoInteractions(userService);
    }

    @Test
    // Проверка: успешное обновление профиля -> данные профиля
    void updateProfileReturnsUpdatedUser() throws Exception {
        UUID userId = UUID.randomUUID();
        UserProfileDto dto = new UserProfileDto(
                userId,
                "new_login",
                "Alex",
                "Ivanov",
                "receipts/u/avatar.png",
                LocalDateTime.of(2026, 5, 1, 10, 0),
                LocalDateTime.of(2026, 5, 31, 12, 0)
        );

        UpdateProfileRequest request = new UpdateProfileRequest("Alex", "Ivanov", "receipts/u/avatar.png", "new_login");
        when(userService.updateUser(userId, request)).thenReturn(dto);

        String payload = objectMapper.writeValueAsString(Map.of(
                "first_name", "Alex",
                "second_name", "Ivanov",
                "avatar_url", "receipts/u/avatar.png",
                "login", "new_login"
        ));

        authenticate(userId);

        mockMvc.perform(patch("/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.login").value("new_login"))
                .andExpect(jsonPath("$.first_name").value("Alex"))
                .andExpect(jsonPath("$.second_name").value("Ivanov"))
                .andExpect(jsonPath("$.avatar_url").value("receipts/u/avatar.png"));

        verify(userService).updateUser(userId, request);
    }

    @Test
    // Проверка: логин уже используется при обновлении профиля -> 409
    void updateProfileReturnsConflictWhenLoginTaken() throws Exception {
        UUID userId = UUID.randomUUID();
        doThrow(new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "Логин уже используется"))
                .when(userService)
                .updateUser(org.mockito.ArgumentMatchers.eq(userId), org.mockito.ArgumentMatchers.any(UpdateProfileRequest.class));

        String payload = objectMapper.writeValueAsString(Map.of("login", "occupied"));

        authenticate(userId);

        mockMvc.perform(patch("/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Логин уже используется"));
    }

    @Test
    // Проверка: обновление пароля без авторизации -> 401
    void updatePasswordWithoutAuthReturnsUnauthorized() throws Exception {
        String payload = objectMapper.writeValueAsString(Map.of(
                "current_password", "Current123",
                "new_password", "NewPass123"
        ));

        mockMvc.perform(post("/me/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("User is not authenticated"));

        verifyNoInteractions(userService);
    }

    @Test
    // Проверка: невалидный payload при обновлении пароля -> 400
    void updatePasswordWithInvalidPayloadReturnsBadRequest() throws Exception {
        String payload = objectMapper.writeValueAsString(Map.of(
                "current_password", "short",
                "new_password", "tiny"
        ));

        mockMvc.perform(post("/me/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(userService);
    }

    @Test
    // Проверка: успешное обновление пароля -> 204
    void updatePasswordReturnsNoContent() throws Exception {
        UUID userId = UUID.randomUUID();
        PasswordChangeRequest request = new PasswordChangeRequest("Current123", "NewPass123");

        String payload = objectMapper.writeValueAsString(Map.of(
                "current_password", "Current123",
                "new_password", "NewPass123"
        ));

        authenticate(userId);

        mockMvc.perform(post("/me/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isNoContent());

        verify(userService).updateUserPassword(userId, request);
    }

    @Test
    // Проверка: указание неправильного текущего пароля при обновлении пароля -> 400
    void updatePasswordReturnsBadRequestWhenCurrentPasswordInvalid() throws Exception {
        UUID userId = UUID.randomUUID();

        doThrow(new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Incorrect current password"))
                .when(userService)
                .updateUserPassword(org.mockito.ArgumentMatchers.eq(userId), org.mockito.ArgumentMatchers.any(PasswordChangeRequest.class));

        String payload = objectMapper.writeValueAsString(Map.of(
                "current_password", "Current123",
                "new_password", "NewPass123"
        ));

        authenticate(userId);

        mockMvc.perform(post("/me/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Incorrect current password"));
    }
}
