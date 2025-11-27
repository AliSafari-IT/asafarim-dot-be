package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.dto.StudyNoteResponse;
import be.asafarim.learn.javanotesapi.services.PublicNotesService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/notes")
@CrossOrigin(origins = "*")
public class PublicNotesController {

    private final PublicNotesService service;

    public PublicNotesController(PublicNotesService service) {
        this.service = service;
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
}
