package com.tbank.tevent.s3.exception;

public class ImageAccessDeniedException extends RuntimeException {
    public ImageAccessDeniedException() {
        super("Access to image is denied");
    }
}
