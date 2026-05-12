package com.tbank.tevent.profile.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserProfileDto(
        UUID id,
        String login,
        String first_name,
        String second_name,
        String avatar_url,
        LocalDateTime created_at,
        LocalDateTime updated_at
) {}