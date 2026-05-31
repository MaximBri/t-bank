package com.tbank.tevent.expenses.exception;

public class ExpenseEventCompletedException extends IllegalStateException {
    public ExpenseEventCompletedException() {
        super("Событие уже завершено, модификация расходов невозможна");
    }
}
