package com.tbank.tevent.expenses.exception;

public class ParticipantNotFoundException extends RuntimeException {
    public ParticipantNotFoundException() {
        super("One or more participants not found");
    }
}
