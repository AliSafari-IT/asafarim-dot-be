package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.StudyNoteRequest;
import be.asafarim.learn.javanotesapi.dto.StudyNoteResponse;
import be.asafarim.learn.javanotesapi.entities.StudyNote;
import be.asafarim.learn.javanotesapi.entities.Tag;
import be.asafarim.learn.javanotesapi.repositories.StudyNoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class StudyNoteService {

    private final StudyNoteRepository repository;
    private final TagService tagService;

    public StudyNoteService(StudyNoteRepository repository, TagService tagService) {
        this.repository = repository;
        this.tagService = tagService;
    }

    public List<StudyNoteResponse> getAll(String sort) {
        List<StudyNote> notes = repository.findAll();
        return applySort(notes, sort).stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Search notes by query string (searches title and content)
     */
    public List<StudyNoteResponse> search(String query, String sort) {
        if (query == null || query.trim().isEmpty()) {
            return getAll(sort);
        }
        List<StudyNote> notes = repository.searchByTitleOrContent(query.trim());
        return applySort(notes, sort).stream()
                .map(this::toResponse)
                .toList();
    }
    
    /**
     * Find notes by tag name
     */
    public List<StudyNoteResponse> findByTag(String tagName, String sort) {
        if (tagName == null || tagName.trim().isEmpty()) {
            return getAll(sort);
        }
        List<StudyNote> notes = repository.findByTagName(tagName.trim());
        return applySort(notes, sort).stream()
                .map(this::toResponse)
                .toList();
    }
    
    /**
     * Search notes with query + tag + optional sort
     */
    public List<StudyNoteResponse> searchWithTag(String query, String tagName, String sort) {
        boolean hasQuery = query != null && !query.trim().isEmpty();
        boolean hasTag = tagName != null && !tagName.trim().isEmpty();
        
        if (!hasQuery && !hasTag) {
            return getAll(sort);
        }

        List<StudyNote> notes;
        if (hasQuery && !hasTag) {
            notes = repository.searchByTitleOrContent(query.trim());
        } else if (!hasQuery && hasTag) {
            notes = repository.findByTagName(tagName.trim());
        } else {
            notes = repository.searchByQueryAndTag(query.trim(), tagName.trim());
        }

        return applySort(notes, sort).stream()
                .map(this::toResponse)
                .toList();
    }

    public StudyNoteResponse getById(Long id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new RuntimeException("Note not found"));
    }

    @Transactional
    public StudyNoteResponse create(StudyNoteRequest req) {
        var note = new StudyNote(req.getTitle(), req.getContent());
        
        // Handle tags
        Set<Tag> tags = tagService.findOrCreateTags(req.getTags());
        note.setTags(tags);
        
        repository.save(note);
        return toResponse(note);
    }

    @Transactional
    public StudyNoteResponse update(Long id, StudyNoteRequest req) {
        var note = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        note.setTitle(req.getTitle());
        note.setContent(req.getContent());
        
        // Update tags
        note.getTags().clear();
        Set<Tag> tags = tagService.findOrCreateTags(req.getTags());
        note.setTags(tags);

        repository.save(note);
        return toResponse(note);
    }

    @Transactional
    public void delete(Long id) {
        var note = repository.findById(id).orElse(null);
        if (note != null) {
            note.getTags().clear();
            repository.delete(note);
        }
    }

    // Get the number of all documents in table
    public long getCount() {
        return repository.count();
    }

    private StudyNoteResponse toResponse(StudyNote n) {
        int wordCount = 0;
        if (n.getContent() != null && !n.getContent().isBlank()) {
            String[] words = n.getContent().trim().split("\\s+");
            wordCount = (int) java.util.Arrays.stream(words)
                    .filter(w -> !w.isBlank())
                    .count();
        }

        int readingTimeMinutes = Math.max(1, (int) Math.ceil(wordCount / 200.0));

        List<String> tagNames = n.getTags().stream()
                .map(Tag::getName)
                .sorted()
                .toList();
        
        return new StudyNoteResponse(
                n.getId(),
                n.getTitle(),
                n.getContent(),
                n.getCreatedAt(),
                n.getUpdatedAt(),
                readingTimeMinutes,
                wordCount,
                tagNames
        );
    }

    private List<StudyNote> applySort(List<StudyNote> notes, String sort) {
        if (notes == null || notes.isEmpty()) {
            return notes;
        }

        String normalized = sort != null ? sort.toLowerCase(Locale.ROOT) : "";
        Comparator<StudyNote> comparator;

        switch (normalized) {
            case "oldest":
                comparator = Comparator.comparing(StudyNote::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder()));
                break;
            case "az":
                comparator = Comparator.comparing(
                        n -> n.getTitle() != null ? n.getTitle().toLowerCase(Locale.ROOT) : "",
                        Comparator.naturalOrder()
                );
                break;
            case "za":
                comparator = Comparator.comparing(
                        (StudyNote n) -> n.getTitle() != null ? n.getTitle().toLowerCase(Locale.ROOT) : "",
                        Comparator.reverseOrder()
                );
                break;
            case "readingtime":
                comparator = Comparator.comparingInt(this::calculateReadingTime)
                        .thenComparing(StudyNote::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()));
                break;
            case "wordcount":
                comparator = Comparator.comparingInt(this::calculateWordCount)
                        .thenComparing(StudyNote::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()));
                break;
            case "newest":
            default:
                comparator = Comparator.comparing(StudyNote::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder()));
                break;
        }

        return notes.stream()
                .sorted(comparator)
                .toList();
    }

    private int calculateWordCount(StudyNote n) {
        if (n.getContent() == null || n.getContent().isBlank()) {
            return 0;
        }
        String[] words = n.getContent().trim().split("\\s+");
        return (int) java.util.Arrays.stream(words)
                .filter(w -> !w.isBlank())
                .count();
    }

    private int calculateReadingTime(StudyNote n) {
        int wc = calculateWordCount(n);
        return Math.max(1, (int) Math.ceil(wc / 200.0));
    }
}
