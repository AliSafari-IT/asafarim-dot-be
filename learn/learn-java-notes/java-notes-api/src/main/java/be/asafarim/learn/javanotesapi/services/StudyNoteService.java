package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.NoteAnalytics;
import be.asafarim.learn.javanotesapi.dto.StudyNoteRequest;
import be.asafarim.learn.javanotesapi.dto.StudyNoteResponse;
import be.asafarim.learn.javanotesapi.entities.StudyNote;
import be.asafarim.learn.javanotesapi.entities.Tag;
import be.asafarim.learn.javanotesapi.entities.User;
import be.asafarim.learn.javanotesapi.repositories.StudyNoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class StudyNoteService {

    private final StudyNoteRepository repository;
    private final TagService tagService;
    private final AuthService authService;
    private final NoteViewService noteViewService;

    public StudyNoteService(StudyNoteRepository repository, TagService tagService,
            AuthService authService, NoteViewService noteViewService) {
        this.repository = repository;
        this.tagService = tagService;
        this.authService = authService;
        this.noteViewService = noteViewService;
    }

    public List<StudyNoteResponse> getAll(String sort) {
        User currentUser = authService.getCurrentUser();
        List<StudyNote> notes = repository.findByUserOrderByCreatedAtDesc(currentUser);
        return applySort(notes, sort).stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Search notes by query string (searches title and content)
     */
    public List<StudyNoteResponse> search(String query, String sort) {
        User currentUser = authService.getCurrentUser();
        if (query == null || query.trim().isEmpty()) {
            return getAll(sort);
        }
        List<StudyNote> notes = repository.searchByTitleOrContentForUser(query.trim(), currentUser);
        return applySort(notes, sort).stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Find notes by tag name
     */
    public List<StudyNoteResponse> findByTag(String tagName, String sort) {
        User currentUser = authService.getCurrentUser();
        if (tagName == null || tagName.trim().isEmpty()) {
            return getAll(sort);
        }
        List<StudyNote> notes = repository.findByTagNameForUser(tagName.trim(), currentUser);
        return applySort(notes, sort).stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Search notes with query + tag + optional sort
     */
    public List<StudyNoteResponse> searchWithTag(String query, String tagName, String sort) {
        User currentUser = authService.getCurrentUser();
        boolean hasQuery = query != null && !query.trim().isEmpty();
        boolean hasTag = tagName != null && !tagName.trim().isEmpty();

        if (!hasQuery && !hasTag) {
            return getAll(sort);
        }

        List<StudyNote> notes;
        if (hasQuery && !hasTag) {
            notes = repository.searchByTitleOrContentForUser(query.trim(), currentUser);
        } else if (!hasQuery && hasTag) {
            notes = repository.findByTagNameForUser(tagName.trim(), currentUser);
        } else {
            notes = repository.searchByQueryAndTagForUser(query.trim(), tagName.trim(), currentUser);
        }

        return applySort(notes, sort).stream()
                .map(this::toResponse)
                .toList();
    }

    public StudyNoteResponse getById(UUID id) {
        User currentUser = authService.getCurrentUser();
        
        // First get the note without analytics (to avoid transaction issues)
        StudyNote note = repository.findById(id)
                .filter(n -> n.getUser().getId().equals(currentUser.getId()))
                .orElseThrow(() -> new RuntimeException("Note not found or you don't have permission to access it"));
        
        // Convert to response without analytics first
        StudyNoteResponse response = toResponse(note);
        
        // Then try to add analytics separately (outside the main query)
        try {
            NoteAnalytics analytics = noteViewService.getSafeAnalytics(note.getId());
            response.setAnalytics(analytics);
        } catch (Exception e) {
            // Analytics failed, but note still loads
            System.err.println("Warning: Could not load analytics for note: " + e.getMessage());
        }
        
        return response;
    }

    @Transactional
    public StudyNoteResponse create(StudyNoteRequest req) {
        User currentUser = authService.getCurrentUser();
        var note = new StudyNote(req.getTitle(), req.getContent(), currentUser);
        note.setPublic(req.isPublic());

        // Handle tags
        Set<Tag> tags = tagService.findOrCreateTags(req.getTags());
        note.setTags(tags);

        repository.save(note);
        return toResponse(note);
    }

    @Transactional
    public StudyNoteResponse update(UUID id, StudyNoteRequest req) {
        User currentUser = authService.getCurrentUser();
        var note = repository.findById(id)
                .filter(n -> n.getUser().getId().equals(currentUser.getId()))
                .orElseThrow(() -> new RuntimeException("Note not found or you don't have permission to access it"));

        note.setTitle(req.getTitle());
        note.setContent(req.getContent());
        note.setPublic(req.isPublic());

        // Update tags
        note.getTags().clear();
        Set<Tag> tags = tagService.findOrCreateTags(req.getTags());
        note.setTags(tags);

        repository.save(note);
        return toResponse(note);
    }

    @Transactional
    public void delete(UUID id) {
        User currentUser = authService.getCurrentUser();
        var note = repository.findById(id)
                .filter(n -> n.getUser().getId().equals(currentUser.getId()))
                .orElse(null);
        if (note != null) {
            note.getTags().clear();
            repository.delete(note);
        }
    }

    // Get the number of documents for current user
    public long getCount() {
        User currentUser = authService.getCurrentUser();
        return repository.countByUser(currentUser);
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
                n.isPublic(),
                tagNames);
    }

    /**
     * Convert note to response with SAFE analytics (never throws, returns empty on error)
     * Use this for API responses where analytics failure should not break the request.
     */
    private StudyNoteResponse toResponseWithSafeAnalytics(StudyNote n) {
        StudyNoteResponse response = toResponse(n);
        NoteAnalytics analytics = noteViewService.getSafeAnalytics(n.getId());
        response.setAnalytics(analytics);
        return response;
    }

    /**
     * Convert note to response with analytics data (may throw on DB errors)
     */
    private StudyNoteResponse toResponseWithAnalytics(StudyNote n) {
        StudyNoteResponse response = toResponse(n);
        NoteAnalytics analytics = noteViewService.getAnalytics(n.getId());
        response.setAnalytics(analytics);
        return response;
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
                        Comparator.naturalOrder());
                break;
            case "za":
                comparator = Comparator.comparing(
                        (StudyNote n) -> n.getTitle() != null ? n.getTitle().toLowerCase(Locale.ROOT) : "",
                        Comparator.reverseOrder());
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
