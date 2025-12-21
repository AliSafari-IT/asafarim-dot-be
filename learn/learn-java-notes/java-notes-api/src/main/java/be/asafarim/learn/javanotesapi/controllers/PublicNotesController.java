package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.dto.MessageResponse;
import be.asafarim.learn.javanotesapi.dto.StudyNoteResponse;
import be.asafarim.learn.javanotesapi.services.NoteViewService;
import be.asafarim.learn.javanotesapi.services.PublicNotesService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/notes")
@CrossOrigin(origins = "*")
public class PublicNotesController {

    private final PublicNotesService service;
    private final NoteViewService viewService;

    public PublicNotesController(PublicNotesService service, NoteViewService viewService) {
        this.service = service;
        this.viewService = viewService;
    }

    @GetMapping
    public List<StudyNoteResponse> getAllPublicNotes(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false, defaultValue = "newest") String sort
    ) {
        return service.getPublicNotes(query, tag, sort);
    }

    @GetMapping("/{id}")
    public StudyNoteResponse getPublicNoteById(@PathVariable UUID id) {
        return service.getPublicNoteById(id);
    }

    @GetMapping("/count")
    public long getPublicNotesCount() {
        return service.getPublicNotesCount();
    }

    /**
     * Get the client IP address, handling proxies
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Take the first IP in case of multiple proxies
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}
