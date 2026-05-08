package com.tbank.tevent.auth.dto;

import java.util.UUID;

public record RegisterResponse(UUID userId, UUID joinedGroupId) {}
