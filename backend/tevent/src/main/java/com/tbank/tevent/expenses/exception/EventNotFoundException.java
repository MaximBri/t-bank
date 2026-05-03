package com.tbank.tevent.expenses.exception;

public class EventNotFoundException extends RuntimeException {
    public EventNotFoundException() {
        super("Event not found");
    }
}
