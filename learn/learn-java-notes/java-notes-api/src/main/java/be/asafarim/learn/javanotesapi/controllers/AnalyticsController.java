package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.dto.DashboardAnalytics;
import be.asafarim.learn.javanotesapi.services.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    /**
     * Get dashboard analytics for the current authenticated user.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardAnalytics> getDashboardAnalytics() {
        try {
            DashboardAnalytics analytics = analyticsService.getDashboardAnalytics();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            // Return empty analytics on error
            return ResponseEntity.ok(new DashboardAnalytics());
        }
    }
}
