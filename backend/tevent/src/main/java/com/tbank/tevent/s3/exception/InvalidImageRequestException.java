package com.tbank.tevent.s3.exception;

public class InvalidImageRequestException extends RuntimeException {
    public InvalidImageRequestException(String message) {
        super(message);
    }
}
