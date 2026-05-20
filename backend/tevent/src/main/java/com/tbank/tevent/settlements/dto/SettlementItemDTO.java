package com.tbank.tevent.settlements.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record SettlementItemDTO(
        UUID paymentId,
        UUID debtorId,
        String debtorName,
        UUID creditorId,
        String creditorName,
        BigDecimal amount,
        String status,
        boolean isCurrentUserRelated
) {}