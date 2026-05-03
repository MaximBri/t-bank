package com.tbank.tevent.category.exception;

public class EventNotFoundException extends RuntimeException {
    public EventNotFoundException() {
        super("Event not found");
    }
}
