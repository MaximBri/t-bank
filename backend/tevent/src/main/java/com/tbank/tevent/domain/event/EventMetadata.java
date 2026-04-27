package com.tbank.tevent.domain.event;

import java.util.Map;

/**
 * Метаданные события
 */
public record EventMetadata(
    String correlationId,
    String causationId,
    String userId,
    String userAgent,
    String ipAddress,
    Map<String, Object> additionalData
) {
    
    public EventMetadata {
        if (additionalData == null) {
            additionalData = Map.of();
        }
    }
    
    public EventMetadata(String correlationId, String userId) {
        this(correlationId, null, userId, null, null, Map.of());
    }
    
    public EventMetadata withCausationId(String causationId) {
        return new EventMetadata(
            correlationId,
            causationId,
            userId,
            userAgent,
            ipAddress,
            additionalData
        );
    }
    
    public EventMetadata withAdditionalData(String key, Object value) {
        Map<String, Object> newData = Map.copyOf(additionalData);
        newData.put(key, value);
        return new EventMetadata(
            correlationId,
            causationId,
            userId,
            userAgent,
            ipAddress,
            newData
        );
    }
    
    public <T> T getAdditionalData(String key, Class<T> type) {
        Object value = additionalData.get(key);
        if (value == null) {
            return null;
        }
        return type.cast(value);
    }
}