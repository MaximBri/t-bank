package com.tbank.tevent;

import com.tbank.tevent.settlements.dto.EventSettlementsResponse;

import java.util.UUID;

public interface EventBalanceRepository {
    void cacheSettlements(UUID eventId, EventSettlementsResponse response);
    EventSettlementsResponse getCachedSettlements(UUID eventId);
    void clearCalculatedDebts(UUID eventId);
}
