package com.tbank.tevent.application.controller;

import com.tbank.tevent.application.dto.request.PasswordChangeRequest;
import com.tbank.tevent.application.dto.request.UpdateProfileRequest;
import com.tbank.tevent.application.dto.response.UserProfileDTO;
import com.tbank.tevent.application.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Контроллер для управления профилем пользователя.
 */
@RestController
@RequestMapping("/api/v1/profile")
@Tag(name = "User Profile", description = "Управление профилем пользователя и настройками")
public class ProfileController {

    private final UserProfileService userProfileService;

    public ProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping
    @Operation(summary = "Получить профиль текущего пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Профиль получен"),
            @ApiResponse(responseCode = "401", description = "Пользователь не авторизован")
    })
    public ResponseEntity<UserProfileDTO> getCurrentUserProfile() {
        UserProfileDTO profile = userProfileService.getCurrentUserProfile();
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    @Operation(summary = "Обновить профиль текущего пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Профиль обновлен"),
            @ApiResponse(responseCode = "400", description = "Некорректные данные"),
            @ApiResponse(responseCode = "401", description = "Пользователь не авторизован"),
            @ApiResponse(responseCode = "409", description = "Email уже используется")
    })
    public ResponseEntity<UserProfileDTO> updateProfile(
            @RequestBody @Valid UpdateProfileRequest request) {
        UserProfileDTO updatedProfile = userProfileService.updateProfile(request);
        return ResponseEntity.ok(updatedProfile);
    }

    @PostMapping("/password")
    @Operation(summary = "Изменить пароль текущего пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Пароль изменен"),
            @ApiResponse(responseCode = "400", description = "Некорректные данные"),
            @ApiResponse(responseCode = "401", description = "Пользователь не авторизован"),
            @ApiResponse(responseCode = "403", description = "Текущий пароль неверен")
    })
    public ResponseEntity<Void> changePassword(
            @RequestBody @Valid PasswordChangeRequest request) {
        userProfileService.changePassword(request);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/avatar")
    @Operation(summary = "Загрузить аватар пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Аватар загружен"),
            @ApiResponse(responseCode = "400", description = "Некорректные данные"),
            @ApiResponse(responseCode = "401", description = "Пользователь не авторизован")
    })
    public ResponseEntity<String> uploadAvatar(
            @RequestParam @Parameter(description = "Ключ изображения в MinIO") String imageKey) {
        String avatarUrl = userProfileService.uploadAvatar(imageKey);
        return ResponseEntity.ok(avatarUrl);
    }

    @DeleteMapping("/avatar")
    @Operation(summary = "Удалить аватар пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Аватар удален"),
            @ApiResponse(responseCode = "401", description = "Пользователь не авторизован")
    })
    public ResponseEntity<Void> deleteAvatar() {
        userProfileService.deleteAvatar();
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Получить профиль пользователя по ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Профиль получен"),
            @ApiResponse(responseCode = "404", description = "Пользователь не найден")
    })
    public ResponseEntity<UserProfileDTO> getUserProfile(
            @PathVariable @Parameter(description = "ID пользователя") Integer userId) {
        UserProfileDTO profile = userProfileService.getUserProfile(userId);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/username/available")
    @Operation(summary = "Проверить, доступен ли username")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Результат проверки")
    })
    public ResponseEntity<Boolean> isUsernameAvailable(
            @RequestParam @Parameter(description = "Имя пользователя для проверки") String username) {
        boolean available = userProfileService.isUsernameAvailable(username);
        return ResponseEntity.ok(available);
    }
}