package com.tbank.tevent.expenses.exception;

public class ExpensePayerInParticipantsException extends IllegalArgumentException {
    public ExpensePayerInParticipantsException() {
        super("Плательщик не должен быть явно указан в списке участников.");
    }
}
