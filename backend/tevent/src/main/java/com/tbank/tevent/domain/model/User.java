package com.tbank.tevent.domain.model;

import java.time.Instant;
import java.util.Objects;

/**
 * Доменная модель пользователя
 */
public class User {
    
    private Long id;
    private String username;
    private String email;
    private String passwordHash;
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private boolean active = true;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant lastLoginAt;
    
    // Конструкторы
    
    public User() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }
    
    public User(String username, String email, String passwordHash) {
        this();
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
    }
    
    public User(String username, String email, String passwordHash, String firstName, String lastName) {
        this(username, email, passwordHash);
        this.firstName = firstName;
        this.lastName = lastName;
    }
    
    // Бизнес-методы
    
    /**
     * Обновление времени последнего входа
     */
    public void updateLastLogin() {
        this.lastLoginAt = Instant.now();
        this.updatedAt = Instant.now();
    }
    
    /**
     * Активация пользователя
     */
    public void activate() {
        this.active = true;
        this.updatedAt = Instant.now();
    }
    
    /**
     * Деактивация пользователя
     */
    public void deactivate() {
        this.active = false;
        this.updatedAt = Instant.now();
    }
    
    /**
     * Обновление пароля
     */
    public void changePassword(String newPasswordHash) {
        this.passwordHash = newPasswordHash;
        this.updatedAt = Instant.now();
    }
    
    /**
     * Получение полного имени пользователя
     */
    public String getFullName() {
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        } else if (firstName != null) {
            return firstName;
        } else if (lastName != null) {
            return lastName;
        } else {
            return username;
        }
    }
    
    /**
     * Получение инициалов пользователя
     */
    public String getInitials() {
        StringBuilder initials = new StringBuilder();
        if (firstName != null && !firstName.isEmpty()) {
            initials.append(firstName.charAt(0));
        }
        if (lastName != null && !lastName.isEmpty()) {
            initials.append(lastName.charAt(0));
        }
        return initials.length() > 0 ? initials.toString() : username.substring(0, Math.min(2, username.length()));
    }
    
    /**
     * Проверка, является ли пользователь активным
     */
    public boolean isActive() {
        return active;
    }
    
    /**
     * Проверка, является ли email подтвержденным
     * (в будущей реализации можно добавить поле emailVerified)
     */
    public boolean isEmailVerified() {
        return true; // Заглушка для будущей реализации
    }
    
    // Геттеры и сеттеры
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
        this.updatedAt = Instant.now();
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
        this.updatedAt = Instant.now();
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
        this.updatedAt = Instant.now();
    }
    
    public String getPasswordHash() {
        return passwordHash;
    }
    
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
        this.updatedAt = Instant.now();
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
        this.updatedAt = Instant.now();
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
        this.updatedAt = Instant.now();
    }
    
    public String getAvatarUrl() {
        return avatarUrl;
    }
    
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
        this.updatedAt = Instant.now();
    }
    
    public void setActive(boolean active) {
        this.active = active;
        this.updatedAt = Instant.now();
    }
    
    public Instant getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
    
    public Instant getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Instant getLastLoginAt() {
        return lastLoginAt;
    }
    
    public void setLastLoginAt(Instant lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
        this.updatedAt = Instant.now();
    }
    
    // equals, hashCode, toString
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
    
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", active=" + active +
                '}';
    }
}