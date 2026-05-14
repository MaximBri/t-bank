package com.tbank.tevent.invitations.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record OwnerInvitationResponse(
        UUID id,
        String title,
        String login,
        String status,
        LocalDateTime createdAt
) {}
