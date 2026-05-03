package com.tbank.tevent.category.exception;

public class CategoryAlreadyExistsException extends RuntimeException {
    public CategoryAlreadyExistsException() {
        super("Category with this name already exists");
    }
}
