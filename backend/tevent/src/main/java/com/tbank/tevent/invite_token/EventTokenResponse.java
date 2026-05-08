package com.tbank.tevent.invite_token;

import java.time.LocalDateTime;

public record EventTokenResponse(
        String token,
        LocalDateTime expiresAt
) {}
