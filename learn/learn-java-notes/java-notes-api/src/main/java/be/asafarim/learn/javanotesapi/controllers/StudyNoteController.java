package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.dto.StudyNoteRequest;
import be.asafarim.learn.javanotesapi.dto.StudyNoteResponse;
import be.asafarim.learn.javanotesapi.services.StudyNoteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*")
public class StudyNoteController {

    private final StudyNoteService service;

    public StudyNoteController(StudyNoteService service) {
        this.service = service;
    }

    @GetMapping
    public List<StudyNoteResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public StudyNoteResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public StudyNoteResponse create(@RequestBody StudyNoteRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public StudyNoteResponse update(
            @PathVariable Long id,
            @RequestBody StudyNoteRequest req
    ) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/count")
    public long getCount() {
        return service.getCount();
    }
}
