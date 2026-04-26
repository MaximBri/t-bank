package com.tbank.tevent.auth;

import java.util.UUID;

public record AuthTokens(String accessToken, String refreshToken, UUID userId) {}
