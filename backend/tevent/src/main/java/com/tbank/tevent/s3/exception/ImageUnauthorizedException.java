package com.tbank.tevent.s3.exception;

public class ImageUnauthorizedException extends RuntimeException {
    public ImageUnauthorizedException() {
        super("Unauthorized");
    }
}
