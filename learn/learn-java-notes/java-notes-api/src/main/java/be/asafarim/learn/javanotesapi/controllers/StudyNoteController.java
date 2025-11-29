package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.dto.MessageResponse;
import be.asafarim.learn.javanotesapi.dto.NoteAnalytics;
import be.asafarim.learn.javanotesapi.dto.SlugUpdateRequest;
import be.asafarim.learn.javanotesapi.dto.StudyNoteRequest;
import be.asafarim.learn.javanotesapi.dto.StudyNoteResponse;
import be.asafarim.learn.javanotesapi.dto.VisibilityResponse;
import be.asafarim.learn.javanotesapi.dto.VisibilityUpdateRequest;
import be.asafarim.learn.javanotesapi.services.NoteViewService;
import be.asafarim.learn.javanotesapi.services.StudyNoteService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*")
public class StudyNoteController {

    private final StudyNoteService service;
    private final NoteViewService viewService;

    public StudyNoteController(StudyNoteService service, NoteViewService viewService) {
        this.service = service;
        this.viewService = viewService;
    }

    @GetMapping
    public List<StudyNoteResponse> getAll(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false, defaultValue = "newest") String sort) {
        return service.searchWithTag(query, tag, sort);
    }

    @GetMapping("/{id}")
    public StudyNoteResponse getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @PostMapping
    public StudyNoteResponse create(@RequestBody StudyNoteRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public StudyNoteResponse update(
            @PathVariable UUID id,
            @RequestBody StudyNoteRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    @GetMapping("/count")
    public long getCount() {
        return service.getCount();
    }

    /**
     * Track a view for an authenticated user's note.
     * Called when someone opens the note details page.
     */
    @PostMapping("/{id}/view")
    public ResponseEntity<MessageResponse> trackView(
            @PathVariable UUID id,
            HttpServletRequest request
    ) {
        try {
            String userAgent = request.getHeader("User-Agent");
            String ipAddress = getClientIpAddress(request);
            viewService.trackAuthenticatedView(id, userAgent, ipAddress);
            return ResponseEntity.ok(new MessageResponse("View tracked successfully"));
        } catch (Exception e) {
            // View tracking is non-critical, don't fail the request
            System.err.println("Warning: Could not track view: " + e.getMessage());
            return ResponseEntity.ok(new MessageResponse("View tracking skipped"));
        }
    }

    /**
     * Get analytics for a specific note (owner only)
     */
    @GetMapping("/{id}/analytics")
    public ResponseEntity<NoteAnalytics> getAnalytics(@PathVariable UUID id) {
        try {
            NoteAnalytics analytics = viewService.getAnalyticsForOwner(id);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            // Return empty analytics if not available
            return ResponseEntity.ok(new NoteAnalytics(0, 0, 0, 0, 0, 0));
        }
    }

    /**
     * Get the client IP address, handling proxies
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    // ============ Visibility Management Endpoints ============

    /**
     * Get visibility status for a note
     */
    @GetMapping("/{id}/visibility")
    public ResponseEntity<VisibilityResponse> getVisibility(@PathVariable UUID id) {
        try {
            VisibilityResponse response = service.getVisibility(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update visibility for a note
     */
    @PutMapping("/{id}/visibility")
    public ResponseEntity<VisibilityResponse> updateVisibility(
            @PathVariable UUID id,
            @RequestBody VisibilityUpdateRequest request) {
        try {
            VisibilityResponse response = service.updateVisibility(id, request.getVisibility());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update custom slug for a note
     */
    @PutMapping("/{id}/slug")
    public ResponseEntity<VisibilityResponse> updateSlug(
            @PathVariable UUID id,
            @RequestBody SlugUpdateRequest request) {
        try {
            VisibilityResponse response = service.updateSlug(id, request.getSlug());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
