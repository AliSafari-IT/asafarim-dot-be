package be.asafarim.learn.javanotesapi.exceptions;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Global exception handler to prevent Spring Security from treating
 * database errors as authentication failures (401).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle database access exceptions.
     * Returns 500 Internal Server Error instead of letting Spring Security
     * intercept and return 401.
     */
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, String>> handleDataAccessException(DataAccessException ex) {
        System.err.println("Database error: " + ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "error", "Database error",
                        "message", ex.getMostSpecificCause().getMessage()
                ));
    }

    /**
     * Handle generic runtime exceptions.
     * Provides a clean error response instead of stack traces.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        // Check if it's a "not found" type error
        String message = ex.getMessage();
        if (message != null && (message.contains("not found") || message.contains("Not found"))) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "error", "Not found",
                            "message", message
                    ));
        }

        // Check if it's a permission error
        if (message != null && message.contains("permission")) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "error", "Forbidden",
                            "message", message
                    ));
        }

        // Generic server error
        System.err.println("Runtime error: " + ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "error", "Server error",
                        "message", message != null ? message : "An unexpected error occurred"
                ));
    }
}
