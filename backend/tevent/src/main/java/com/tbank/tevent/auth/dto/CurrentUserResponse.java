package com.tbank.tevent.auth.dto;

import java.util.UUID;

public record CurrentUserResponse(String username, UUID userId) {}
