package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.dto.PublicNoteListItem;
import be.asafarim.learn.javanotesapi.dto.PublicNoteResponse;
import be.asafarim.learn.javanotesapi.services.PublicSharingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for public note access and sharing
 * No authentication required for these endpoints
 */
@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicSharingController {

    private final PublicSharingService sharingService;

    public PublicSharingController(PublicSharingService sharingService) {
        this.sharingService = sharingService;
    }

    /**
     * Get public note by publicId
     * Accessible via: /p/{publicId} or /p/{publicId}/{slug}
     */
    @GetMapping("/notes/by-id/{publicId}")
    public ResponseEntity<PublicNoteResponse> getByPublicId(@PathVariable String publicId) {
        try {
            PublicNoteResponse note = sharingService.getByPublicId(publicId);
            // Track view asynchronously
            sharingService.trackView(publicId);
            return ResponseEntity.ok(note);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Track view for a public note (separate endpoint for explicit tracking)
     */
    @PostMapping("/notes/{publicId}/view")
    public ResponseEntity<Void> trackView(@PathVariable String publicId) {
        try {
            sharingService.trackView(publicId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get featured notes for feed
     */
    @GetMapping("/feed/featured")
    public ResponseEntity<List<PublicNoteListItem>> getFeaturedNotes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<PublicNoteListItem> notes = sharingService.getFeaturedNotes(page, Math.min(size, 50));
        return ResponseEntity.ok(notes);
    }

    /**
     * Get trending notes (most viewed in last 7 days)
     */
    @GetMapping("/feed/trending")
    public ResponseEntity<List<PublicNoteListItem>> getTrendingNotes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<PublicNoteListItem> notes = sharingService.getTrendingNotes(page, Math.min(size, 50));
        return ResponseEntity.ok(notes);
    }

    /**
     * Get recent public notes
     */
    @GetMapping("/feed/recent")
    public ResponseEntity<List<PublicNoteListItem>> getRecentNotes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<PublicNoteListItem> notes = sharingService.getRecentNotes(page, Math.min(size, 50));
        return ResponseEntity.ok(notes);
    }

    /**
     * Get public notes by tag
     */
    @GetMapping("/feed/by-tag")
    public ResponseEntity<List<PublicNoteListItem>> getNotesByTag(
            @RequestParam String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<PublicNoteListItem> notes = sharingService.getNotesByTag(tag, page, Math.min(size, 50));
        return ResponseEntity.ok(notes);
    }
}
