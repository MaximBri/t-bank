package com.tbank.tevent.settlements.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record EventSettlementsResponse(
        UUID eventId,
        BigDecimal totalOutstandingDebts,
        List<SettlementItemDTO> settlements
) {}
