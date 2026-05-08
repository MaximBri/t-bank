package com.tbank.tevent.invitations.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record MyInvitationResponse(
        UUID id,
        String title,
        String status,
        LocalDateTime createdAt
) {}