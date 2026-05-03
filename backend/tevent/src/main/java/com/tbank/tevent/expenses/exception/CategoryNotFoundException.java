package com.tbank.tevent.expenses.exception;

public class CategoryNotFoundException extends RuntimeException {
    public CategoryNotFoundException() {
        super("Category not found for event. Check event-specific or default categories");
    }
}
