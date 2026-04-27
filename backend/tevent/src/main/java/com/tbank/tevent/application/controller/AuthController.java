package com.tbank.tevent.application.controller;

import com.tbank.tevent.application.dto.request.AuthRequest;
import com.tbank.tevent.application.dto.response.AuthResponse;
import com.tbank.tevent.application.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * Контроллер для аутентификации и авторизации
 */
@RestController
@RequestMapping("/api/v1/auth")
@Validated
public class AuthController {
    
    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    /**
     * Регистрация нового пользователя
     * 
     * @param request данные для регистрации
     * @return информация о зарегистрированном пользователе
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody @Valid AuthRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Вход в систему
     * 
     * @param request данные для входа
     * @return информация об аутентифицированном пользователе
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Выход из системы
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        authService.logout();
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Обновление access token
     */
    @PostMapping("/refresh")
    public ResponseEntity<Void> refreshToken() {
        authService.refreshToken();
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Проверка доступности имени пользователя
     * 
     * @param username имя пользователя для проверки
     * @return информация о доступности
     */
    @GetMapping("/check-username")
    public ResponseEntity<UsernameAvailabilityResponse> checkUsernameAvailability(
            @RequestParam @NotBlank String username) {
        boolean available = authService.isUsernameAvailable(username);
        return ResponseEntity.ok(new UsernameAvailabilityResponse(available));
    }
    
    /**
     * Запрос на сброс пароля
     * 
     * @param email email пользователя
     */
    @PostMapping("/password-reset/request")
    public ResponseEntity<Void> requestPasswordReset(@RequestParam @Email String email) {
        authService.requestPasswordReset(email);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Сброс пароля по токену
     * 
     * @param request запрос на сброс пароля
     */
    @PostMapping("/password-reset/confirm")
    public ResponseEntity<Void> resetPassword(@RequestBody @Valid PasswordResetRequest request) {
        authService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Проверка валидности текущей сессии
     */
    @GetMapping("/validate-session")
    public ResponseEntity<SessionValidationResponse> validateSession() {
        boolean valid = authService.validateSession();
        return ResponseEntity.ok(new SessionValidationResponse(valid));
    }
    
    // Вспомогательные DTO для ответов
    
    public record UsernameAvailabilityResponse(boolean available) {}
    
    public record PasswordResetRequest(
        @NotBlank String token,
        @NotBlank String newPassword
    ) {}
    
    public record SessionValidationResponse(boolean valid) {}
}