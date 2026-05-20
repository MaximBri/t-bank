package com.tbank.tevent;

import com.tbank.tevent.settlements.dto.EventSettlementsResponse;
import com.tbank.tevent.settlements.dto.SettlementStep;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class InMemoryEventBalanceRepository implements EventBalanceRepository {
    private final Map<UUID, CacheEntry> cache = new ConcurrentHashMap<>();

    // Аналог TTL в Redis — 24 часа
    private static final Duration CACHE_TTL = Duration.ofHours(24);

    public void cacheSettlements(UUID eventId, EventSettlementsResponse response) {
        Instant expiresAt = Instant.now().plus(CACHE_TTL);
        cache.put(eventId, new CacheEntry(response, expiresAt));
    }

    public EventSettlementsResponse getCachedSettlements(UUID eventId) {
        CacheEntry entry = cache.get(eventId);

        if (entry == null) {
            return null;
        }

        // Проверяем, не протух ли наш кэш (аналог TTL)
        if (Instant.now().isAfter(entry.expiresAt())) {
            cache.remove(eventId); // Удаляем форсированно
            return null;
        }

        return entry.response();
    }

    public void clearCalculatedDebts(UUID eventId) {
        cache.remove(eventId);
    }

    // Вспомогательный рекорд для хранения данных внутри Map
    private record CacheEntry(
            EventSettlementsResponse response,
            Instant expiresAt
    ) {}
}
