package com.tbank.tevent.event;

import java.time.LocalDateTime;

public class Validator {
    public static void validateDates(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null) {
            throw new ValidationException("Start date is required");
        }
        if (endDate == null) {
            throw new ValidationException("End date is required");
        }
        if (startDate.isAfter(endDate)) {
            throw new ValidationException("Start date must be before end date");
        }
        if (endDate.isBefore(LocalDateTime.now())) {
            throw new ValidationException("End date cannot be in the past");
        }
        if (startDate.isBefore(LocalDateTime.now())) {
            throw new ValidationException("Start date cannot be in the past");
        }
        if (startDate.equals(endDate)) {
            throw new ValidationException("Start date and end date cannot be the same");
        }
    }
}
