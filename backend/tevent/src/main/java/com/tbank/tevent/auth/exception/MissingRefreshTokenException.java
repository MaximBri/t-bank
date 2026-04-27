package com.tbank.tevent.auth.exception;

public class MissingRefreshTokenException extends RuntimeException {
    public MissingRefreshTokenException() {
        super("Refresh token is missing");
    }
}
