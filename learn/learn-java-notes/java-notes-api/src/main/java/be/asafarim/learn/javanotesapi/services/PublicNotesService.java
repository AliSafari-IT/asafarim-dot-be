package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.NoteAnalytics;
import be.asafarim.learn.javanotesapi.dto.StudyNoteResponse;
import be.asafarim.learn.javanotesapi.entities.StudyNote;
import be.asafarim.learn.javanotesapi.entities.Tag;
import be.asafarim.learn.javanotesapi.repositories.NoteViewRepository;
import be.asafarim.learn.javanotesapi.repositories.StudyNoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PublicNotesService {

    private final StudyNoteRepository repository;
    private final NoteViewRepository viewRepository;

    public PublicNotesService(StudyNoteRepository repository, NoteViewRepository viewRepository) {
        this.repository = repository;
        this.viewRepository = viewRepository;
    }

    public List<StudyNoteResponse> getPublicNotes(String query, String tag, String sort) {
        boolean hasQuery = query != null && !query.trim().isEmpty();
        boolean hasTag = tag != null && !tag.trim().isEmpty();

        List<StudyNote> notes;
        if (hasQuery && hasTag) {
            notes = repository.searchPublicByQueryAndTag(query.trim(), tag.trim());
        } else if (hasQuery) {
            notes = repository.searchPublicByTitleOrContent(query.trim());
        } else if (hasTag) {
            notes = repository.findPublicByTagName(tag.trim());
        } else {
            notes = repository.findAllPublicNotes();
        }

        return applySort(notes, sort).stream()
                .map(this::toResponse)
                .toList();
    }

    public StudyNoteResponse getPublicNoteById(UUID id) {
        // First get the note without analytics (to avoid transaction issues)
        StudyNote note = repository.findById(id)
                .filter(StudyNote::isPublic)
                .orElseThrow(() -> new RuntimeException("Public note not found"));
        
        // Force load the user to avoid lazy loading issues
        note.getUser().getUsername();
        
        // Convert to response without analytics first
        StudyNoteResponse response = toResponse(note);
        
        // Then try to add analytics separately (outside the main query)
        try {
            NoteAnalytics analytics = getSafeAnalytics(note.getId());
            response.setAnalytics(analytics);
        } catch (Exception e) {
            // Analytics failed, but note still loads
            System.err.println("Warning: Could not load analytics for public note: " + e.getMessage());
        }
        
        return response;
    }

    public long getPublicNotesCount() {
        return repository.countPublicNotes();
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

        StudyNoteResponse response = new StudyNoteResponse(
                n.getId(),
                n.getTitle(),
                n.getContent(),
                n.getCreatedAt(),
                n.getUpdatedAt(),
                readingTimeMinutes,
                wordCount,
                n.isPublic(),
                tagNames,
                n.getUser() != null ? n.getUser().getUsername() : "Unknown"
        );
        
        // Set publicId for citations
        response.setPublicId(n.getPublicId());
        
        return response;
    }

    /**
     * Convert note to response with SAFE analytics (never throws, returns empty on error)
     */
    private StudyNoteResponse toResponseWithSafeAnalytics(StudyNote n) {
        StudyNoteResponse response = toResponse(n);
        NoteAnalytics analytics = getSafeAnalytics(n.getId());
        response.setAnalytics(analytics);
        return response;
    }

    /**
     * Convert note to response with analytics data (for single note view)
     */
    private StudyNoteResponse toResponseWithAnalytics(StudyNote n) {
        StudyNoteResponse response = toResponse(n);
        NoteAnalytics analytics = getAnalytics(n.getId());
        response.setAnalytics(analytics);
        return response;
    }

    /**
     * Get analytics safely - never throws, returns empty on error
     */
    private NoteAnalytics getSafeAnalytics(UUID noteId) {
        try {
            return getAnalytics(noteId);
        } catch (Exception e) {
            System.err.println("Warning: Analytics query failed for public note " + noteId + ": " + e.getMessage());
            return NoteAnalytics.empty();
        }
    }

    /**
     * Get analytics for a specific note (may throw on DB errors)
     */
    private NoteAnalytics getAnalytics(UUID noteId) {
        try {
            LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

            long totalViews = viewRepository.countByNoteId(noteId);
            long publicViews = viewRepository.countPublicViewsByNoteId(noteId);
            long privateViews = viewRepository.countPrivateViewsByNoteId(noteId);
            long viewsLast7Days = viewRepository.countViewsSince(noteId, sevenDaysAgo);
            long viewsLast30Days = viewRepository.countViewsSince(noteId, thirtyDaysAgo);
            long uniqueViewers = viewRepository.countUniqueViewersByNoteId(noteId);

            return new NoteAnalytics(
                totalViews,
                publicViews,
                privateViews,
                viewsLast7Days,
                viewsLast30Days,
                uniqueViewers
            );
        } catch (Exception e) {
            // Analytics table might not exist or have issues - return empty analytics
            System.err.println("Warning: Could not fetch analytics: " + e.getMessage());
            return new NoteAnalytics(0, 0, 0, 0, 0, 0);
        }
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
