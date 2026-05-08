package com.tbank.tevent.repo;

import java.util.UUID;

public record EventParticipantCount(UUID eventId, Long count) {}
