package com.tbank.tevent.settlements.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record SettlementStep(
        UUID fromUserId,
        UUID toUserId,
        BigDecimal amount
) {}