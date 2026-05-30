package com.tbank.tevent.expenses.exception;

public class ExpenseSplitIntegrityException extends IllegalStateException {
    public ExpenseSplitIntegrityException(String splitId) {
        super("Нарушена целостность данных: расход не найден для сплита с ID: " + splitId);
    }
}
