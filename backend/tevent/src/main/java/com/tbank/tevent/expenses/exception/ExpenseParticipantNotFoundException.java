package com.tbank.tevent.expenses.exception;

public class ExpenseParticipantNotFoundException extends RuntimeException {
    public ExpenseParticipantNotFoundException() {
        super("Participant not found for this expense");
    }
}
