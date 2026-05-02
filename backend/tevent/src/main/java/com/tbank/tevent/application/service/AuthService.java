package com.tbank.tevent.application.service;

import com.tbank.tevent.application.dto.request.AuthRequest;
import com.tbank.tevent.application.dto.response.AuthResponse;

/**
 * Сервис аутентификации и авторизации
 */
public interface AuthService {
    
    /**
     * Регистрация нового пользователя
     * 
     * @param request данные для регистрации
     * @return ответ с информацией о пользователе
     */
    AuthResponse register(AuthRequest request);
    
    /**
     * Аутентификация существующего пользователя
     * 
     * @param request данные для входа
     * @return ответ с информацией о пользователе
     */
    AuthResponse login(AuthRequest request);
    
    /**
     * Выход из системы (инвалидация токенов)
     */
    void logout();
    
    /**
     * Обновление access token с помощью refresh token
     */
    void refreshToken();
    
    /**
     * Проверка доступности имени пользователя
     * 
     * @param username имя пользователя для проверки
     * @return true если имя доступно
     */
    boolean isUsernameAvailable(String username);
    
    /**
     * Запрос на сброс пароля
     * 
     * @param email email пользователя
     */
    void requestPasswordReset(String email);
    
    /**
     * Сброс пароля по токену
     * 
     * @param token токен сброса пароля
     * @param newPassword новый пароль
     */
    void resetPassword(String token, String newPassword);
    
    /**
     * Проверка валидности текущей сессии
     * 
     * @return true если сессия валидна
     */
    boolean validateSession();
}