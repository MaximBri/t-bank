package com.tbank.tevent.expenses.exception;

public class ExpenseParticipantsRequiredException extends IllegalArgumentException {
    public ExpenseParticipantsRequiredException() {
        super("Список участников чека не может быть пустым");
    }
}
