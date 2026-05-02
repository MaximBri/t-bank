package com.tbank.tevent.application.service;

import com.tbank.tevent.application.dto.request.PasswordChangeRequest;
import com.tbank.tevent.application.dto.request.UpdateProfileRequest;
import com.tbank.tevent.application.dto.response.UserProfileDTO;

/**
 * Сервис для управления профилем пользователя.
 */
public interface UserProfileService {

    /**
     * Получить профиль текущего пользователя.
     *
     * @return DTO профиля
     */
    UserProfileDTO getCurrentUserProfile();

    /**
     * Обновить профиль текущего пользователя.
     *
     * @param request данные для обновления
     * @return обновленный DTO профиля
     */
    UserProfileDTO updateProfile(UpdateProfileRequest request);

    /**
     * Изменить пароль текущего пользователя.
     *
     * @param request данные для изменения пароля
     */
    void changePassword(PasswordChangeRequest request);

    /**
     * Загрузить аватар пользователя.
     *
     * @param imageKey ключ изображения в MinIO
     * @return URL аватара
     */
    String uploadAvatar(String imageKey);

    /**
     * Удалить аватар пользователя.
     */
    void deleteAvatar();

    /**
     * Получить профиль пользователя по ID.
     *
     * @param userId ID пользователя
     * @return DTO профиля
     */
    UserProfileDTO getUserProfile(Integer userId);

    /**
     * Проверить, доступен ли username.
     *
     * @param username имя пользователя для проверки
     * @return true, если username доступен
     */
    boolean isUsernameAvailable(String username);

    /**
     * Обновить email пользователя.
     *
     * @param userId ID пользователя
     * @param email новый email
     */
    void updateEmail(Integer userId, String email);
}