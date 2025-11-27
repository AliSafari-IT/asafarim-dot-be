package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.StudyNoteResponse;
import be.asafarim.learn.javanotesapi.entities.StudyNote;
import be.asafarim.learn.javanotesapi.entities.Tag;
import be.asafarim.learn.javanotesapi.repositories.StudyNoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PublicNotesService {

    private final StudyNoteRepository repository;

    public PublicNotesService(StudyNoteRepository repository) {
        this.repository = repository;
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
        return repository.findById(id)
                .filter(StudyNote::isPublic)
                .map(this::toResponse)
                .orElseThrow(() -> new RuntimeException("Public note not found"));
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

        return new StudyNoteResponse(
                n.getId(),
                n.getTitle(),
                n.getContent(),
                n.getCreatedAt(),
                n.getUpdatedAt(),
                readingTimeMinutes,
                wordCount,
                n.isPublic(),
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
