package com.tbank.tevent.expenses.exception;

public class ExpenseNotFoundException extends RuntimeException {
    public ExpenseNotFoundException() {super("Expense not found");}
}
