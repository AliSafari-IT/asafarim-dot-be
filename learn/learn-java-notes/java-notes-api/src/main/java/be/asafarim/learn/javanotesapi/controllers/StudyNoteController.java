package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.dto.StudyNoteRequest;
import be.asafarim.learn.javanotesapi.dto.StudyNoteResponse;
import be.asafarim.learn.javanotesapi.services.StudyNoteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*")
public class StudyNoteController {

    private final StudyNoteService service;

    public StudyNoteController(StudyNoteService service) {
        this.service = service;
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
}
