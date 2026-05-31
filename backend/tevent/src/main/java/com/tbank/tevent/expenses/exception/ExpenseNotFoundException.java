package com.tbank.tevent.expenses.exception;

import jakarta.persistence.EntityNotFoundException;

public class ExpenseNotFoundException extends EntityNotFoundException {
    public ExpenseNotFoundException() {
        super("Расход не найден");
    }
}
