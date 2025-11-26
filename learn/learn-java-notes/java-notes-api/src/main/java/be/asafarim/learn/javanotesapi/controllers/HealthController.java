package be.asafarim.learn.javanotesapi.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Health check controller for the Java Notes API.
 * 
 * @RestController combines @Controller and @ResponseBody,
 * meaning all methods return data directly (as JSON) instead of view names.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    /**
     * Health check endpoint.
     * 
     * @return JSON object with status and service name
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "OK",
            "service", "java-notes-api"
        ));
    }

}
