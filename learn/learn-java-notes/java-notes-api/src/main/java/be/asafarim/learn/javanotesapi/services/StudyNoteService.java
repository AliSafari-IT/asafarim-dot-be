package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.StudyNoteRequest;
import be.asafarim.learn.javanotesapi.dto.StudyNoteResponse;
import be.asafarim.learn.javanotesapi.entities.StudyNote;
import be.asafarim.learn.javanotesapi.repositories.StudyNoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudyNoteService {

    private final StudyNoteRepository repository;

    public StudyNoteService(StudyNoteRepository repository) {
        this.repository = repository;
    }

    public List<StudyNoteResponse> getAll() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public StudyNoteResponse getById(Long id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new RuntimeException("Note not found"));
    }

    public StudyNoteResponse create(StudyNoteRequest req) {
        var note = new StudyNote(req.getTitle(), req.getContent());
        repository.save(note);
        return toResponse(note);
    }

    public StudyNoteResponse update(Long id, StudyNoteRequest req) {
        var note = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        note.setTitle(req.getTitle());
        note.setContent(req.getContent());

        repository.save(note);
        return toResponse(note);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    // Get the number of all documents in table
    public long getCount() {
        return repository.count();
    }

    private StudyNoteResponse toResponse(StudyNote n) {
        return new StudyNoteResponse(
                n.getId(),
                n.getTitle(),
                n.getContent(),
                n.getCreatedAt(),
                n.getUpdatedAt()
        );
    }

}
