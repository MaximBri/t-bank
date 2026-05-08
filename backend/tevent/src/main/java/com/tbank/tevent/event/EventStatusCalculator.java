package com.tbank.tevent.event;

import java.time.LocalDateTime;

public class EventStatusCalculator {

    public static String calculate(LocalDateTime startDate, LocalDateTime endDate) {
        LocalDateTime now = LocalDateTime.now();

        if (now.isBefore(startDate)) {
            return "PLANNED";
        } else if (now.isAfter(endDate)) {
            return "COMPLETED";
        } else {
            return "ACTIVE";
        }
    }
}
