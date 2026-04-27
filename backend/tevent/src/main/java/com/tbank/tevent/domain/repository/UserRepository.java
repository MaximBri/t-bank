package com.tbank.tevent.domain.repository;

import com.tbank.tevent.domain.model.User;

import java.util.Optional;

/**
 * Репозиторий для работы с пользователями
 */
public interface UserRepository extends BaseRepository<User, Long> {
    
    /**
     * Поиск пользователя по имени пользователя
     * 
     * @param username имя пользователя
     * @return пользователь, если найден
     */
    Optional<User> findByUsername(String username);
    
    /**
     * Поиск пользователя по email
     * 
     * @param email email пользователя
     * @return пользователь, если найден
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Проверка существования пользователя с указанным именем
     * 
     * @param username имя пользователя
     * @return true если пользователь существует
     */
    boolean existsByUsername(String username);
    
    /**
     * Проверка существования пользователя с указанным email
     * 
     * @param email email пользователя
     * @return true если пользователь существует
     */
    boolean existsByEmail(String email);
    
    /**
     * Поиск пользователей по части имени или фамилии
     * 
     * @param namePart часть имени или фамилии
     * @return список пользователей
     */
    List<User> findByFirstNameContainingOrLastNameContaining(String namePart);
    
    /**
     * Поиск пользователей по статусу активности
     * 
     * @param active статус активности
     * @return список пользователей
     */
    List<User> findByActive(boolean active);
    
    /**
     * Обновление пароля пользователя
     * 
     * @param userId идентификатор пользователя
     * @param passwordHash хэш пароля
     * @return количество обновленных записей
     */
    int updatePassword(Long userId, String passwordHash);
    
    /**
     * Обновление email пользователя
     * 
     * @param userId идентификатор пользователя
     * @param email новый email
     * @return количество обновленных записей
     */
    int updateEmail(Long userId, String email);
    
    /**
     * Обновление аватара пользователя
     * 
     * @param userId идентификатор пользователя
     * @param avatarUrl URL аватара
     * @return количество обновленных записей
     */
    int updateAvatar(Long userId, String avatarUrl);
    
    /**
     * Активация/деактивация пользователя
     * 
     * @param userId идентификатор пользователя
     * @param active новый статус активности
     * @return количество обновленных записей
     */
    int updateActiveStatus(Long userId, boolean active);
    
    /**
     * Поиск пользователей, зарегистрированных после указанной даты
     * 
     * @param date дата
     * @return список пользователей
     */
    List<User> findByCreatedAtAfter(java.time.Instant date);
    
    /**
     * Получение количества активных пользователей
     * 
     * @return количество активных пользователей
     */
    long countByActiveTrue();
}