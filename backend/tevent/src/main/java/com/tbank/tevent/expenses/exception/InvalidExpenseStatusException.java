package com.tbank.tevent.expenses.exception;

public class InvalidExpenseStatusException extends RuntimeException {
    public InvalidExpenseStatusException(String status) {
        super("Invalid status: " + status);
    }
}
