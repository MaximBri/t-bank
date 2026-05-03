package com.tbank.tevent.expenses.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException() {
        super("Unauthorized");
    }
}
