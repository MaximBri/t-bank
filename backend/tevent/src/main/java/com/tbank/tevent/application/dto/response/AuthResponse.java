package com.tbank.tevent.application.dto.response;

/**
 * DTO для ответа аутентификации.
 * Токены устанавливаются в HTTP-only куки, поэтому не возвращаются в теле ответа.
 */
public record AuthResponse(
    Long userId,
    String username,
    Long joinedGroupId
) {
    
    public AuthResponse {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username cannot be null or blank");
        }
    }
    
    public AuthResponse(Long userId, String username) {
        this(userId, username, null);
    }
}