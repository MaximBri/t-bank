package com.tbank.tevent.expenses.exception;

public class MissingConflictReasonException extends RuntimeException {
    public MissingConflictReasonException() {
        super("No reason for conflict");
    }
}
