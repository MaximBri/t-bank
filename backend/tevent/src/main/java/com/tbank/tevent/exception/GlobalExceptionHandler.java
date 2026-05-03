package com.tbank.tevent.exception;

import com.tbank.tevent.auth.exception.InvalidCredentialsException;
import com.tbank.tevent.auth.exception.MissingRefreshTokenException;
import com.tbank.tevent.auth.exception.UserAlreadyExistsException;
import com.tbank.tevent.category.exception.CategoryAlreadyExistsException;
import com.tbank.tevent.category.exception.CategoryNotFoundException;
import com.tbank.tevent.expenses.exception.ExpenseNotFoundException;
import com.tbank.tevent.expenses.exception.ExpenseParticipantNotFoundException;
import com.tbank.tevent.expenses.exception.InvalidExpenseStatusException;
import com.tbank.tevent.expenses.exception.MissingConflictReasonException;
import com.tbank.tevent.expenses.exception.ParticipantNotFoundException;
import com.tbank.tevent.expenses.exception.UserNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleUserAlreadyExists(UserAlreadyExistsException ex) {
        return buildError(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiError> handleInvalidCredentials(InvalidCredentialsException ex) {
        return buildError(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(MissingRefreshTokenException.class)
    public ResponseEntity<ApiError> handleMissingRefreshToken(MissingRefreshTokenException ex) {
        return buildError(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .orElse("Validation failed");

        return buildError(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler({
            CategoryAlreadyExistsException.class
    })
    public ResponseEntity<ApiError> handleConflict(RuntimeException ex) {
        return buildError(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler({
            CategoryNotFoundException.class,
            com.tbank.tevent.category.exception.EventNotFoundException.class,
            com.tbank.tevent.expenses.exception.EventNotFoundException.class,
            ExpenseNotFoundException.class,
            ExpenseParticipantNotFoundException.class
    })
    public ResponseEntity<ApiError> handleNotFound(RuntimeException ex) {
        return buildError(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler({
            ParticipantNotFoundException.class,
            InvalidExpenseStatusException.class,
            MissingConflictReasonException.class,
            com.tbank.tevent.expenses.exception.CategoryNotFoundException.class
    })
    public ResponseEntity<ApiError> handleBadRequest(RuntimeException ex) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiError> handleUnauthorized(UserNotFoundException ex) {
        return buildError(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiError> handleRuntime(RuntimeException ex) {
        log.error("Unhandled runtime exception", ex);
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
    }

    private ResponseEntity<ApiError> buildError(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(new ApiError(message, status.value()));
    }
}
