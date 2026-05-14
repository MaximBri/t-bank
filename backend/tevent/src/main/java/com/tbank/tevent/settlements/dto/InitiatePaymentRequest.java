package com.tbank.tevent.settlements.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record InitiatePaymentRequest(
        UUID toUserId,
        BigDecimal amount
) {}