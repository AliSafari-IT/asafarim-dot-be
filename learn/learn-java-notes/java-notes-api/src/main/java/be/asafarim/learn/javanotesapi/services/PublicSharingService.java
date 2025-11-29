package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.PublicNoteListItem;
import be.asafarim.learn.javanotesapi.dto.PublicNoteResponse;
import be.asafarim.learn.javanotesapi.entities.StudyNote;
import be.asafarim.learn.javanotesapi.entities.Tag;
import be.asafarim.learn.javanotesapi.enums.NoteVisibility;
import be.asafarim.learn.javanotesapi.repositories.AttachmentRepository;
import be.asafarim.learn.javanotesapi.repositories.StudyNoteRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class PublicSharingService {

    private final StudyNoteRepository noteRepository;
    private final AttachmentRepository attachmentRepository;
    private final NoteViewService noteViewService;

    public PublicSharingService(StudyNoteRepository noteRepository,
                                AttachmentRepository attachmentRepository,
                                NoteViewService noteViewService) {
        this.noteRepository = noteRepository;
        this.attachmentRepository = attachmentRepository;
        this.noteViewService = noteViewService;
    }

    /**
     * Get public note by publicId
     */
    public PublicNoteResponse getByPublicId(String publicId) {
        StudyNote note = noteRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        // Check visibility - only PUBLIC, FEATURED, and UNLISTED are accessible
        if (note.getVisibility() == NoteVisibility.PRIVATE) {
            throw new RuntimeException("Note not found");
        }

        return toPublicResponse(note);
    }

    /**
     * Get featured notes for feed
     */
    public List<PublicNoteListItem> getFeaturedNotes(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<StudyNote> notes = noteRepository.findFeaturedNotes(pageable);
        return notes.stream().map(this::toListItem).toList();
    }

    /**
     * Get trending notes (most viewed in last 7 days)
     */
    public List<PublicNoteListItem> getTrendingNotes(int page, int size) {
        LocalDateTime since = LocalDateTime.now().minusDays(7);
        Pageable pageable = PageRequest.of(page, size);
        List<StudyNote> notes = noteRepository.findTrendingNotes(since, pageable);
        return notes.stream().map(this::toListItem).toList();
    }

    /**
     * Get recent public notes
     */
    public List<PublicNoteListItem> getRecentNotes(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<StudyNote> notes = noteRepository.findRecentPublicNotes(pageable);
        return notes.stream().map(this::toListItem).toList();
    }

    /**
     * Get public notes by tag
     */
    public List<PublicNoteListItem> getNotesByTag(String tagName, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<StudyNote> notes = noteRepository.findPublicNotesByTag(tagName, pageable);
        return notes.stream().map(this::toListItem).toList();
    }

    /**
     * Track public note view
     */
    @Transactional
    public void trackView(String publicId) {
        noteRepository.findByPublicId(publicId).ifPresent(note -> {
            if (note.getVisibility() != NoteVisibility.PRIVATE) {
                noteViewService.trackPublicView(note.getId());
            }
        });
    }

    private PublicNoteResponse toPublicResponse(StudyNote note) {
        PublicNoteResponse response = new PublicNoteResponse();
        response.setId(note.getId());
        response.setPublicId(note.getPublicId());
        response.setSlug(note.getSlug());
        response.setTitle(note.getTitle());
        response.setContent(note.getContent());
        response.setExcerpt(generateExcerpt(note.getContent(), 200));
        response.setTags(note.getTags().stream().map(Tag::getName).sorted().toList());
        response.setCreatedAt(note.getCreatedAt());
        response.setUpdatedAt(note.getUpdatedAt());
        response.setReadingTimeMinutes(calculateReadingTime(note.getContent()));
        response.setWordCount(calculateWordCount(note.getContent()));
        response.setVisibility(note.getVisibility());
        response.setAuthorDisplayName(note.getUser() != null ? note.getUser().getUsername() : "Anonymous");
        response.setHasPublicAttachments(attachmentRepository.countPublicByNoteId(note.getId()) > 0);
        response.setViewCount(noteViewService.getViewCount(note.getId()));
        return response;
    }

    private PublicNoteListItem toListItem(StudyNote note) {
        PublicNoteListItem item = new PublicNoteListItem();
        item.setId(note.getId());
        item.setPublicId(note.getPublicId());
        item.setSlug(note.getSlug());
        item.setTitle(note.getTitle());
        item.setExcerpt(generateExcerpt(note.getContent(), 150));
        item.setTags(note.getTags().stream().map(Tag::getName).sorted().toList());
        item.setCreatedAt(note.getCreatedAt());
        item.setReadingTimeMinutes(calculateReadingTime(note.getContent()));
        item.setAuthorDisplayName(note.getUser() != null ? note.getUser().getUsername() : "Anonymous");
        item.setViewCount(noteViewService.getViewCount(note.getId()));
        return item;
    }

    private String generateExcerpt(String content, int maxLength) {
        if (content == null || content.isEmpty()) {
            return "";
        }
        // Strip markdown/HTML and get plain text excerpt
        String plainText = content
                .replaceAll("#+\\s*", "")
                .replaceAll("\\*+", "")
                .replaceAll("_+", "")
                .replaceAll("`+", "")
                .replaceAll("\\[([^\\]]+)\\]\\([^)]+\\)", "$1")
                .replaceAll("<[^>]+>", "")
                .replaceAll("\\s+", " ")
                .trim();

        if (plainText.length() <= maxLength) {
            return plainText;
        }
        return plainText.substring(0, maxLength).trim() + "...";
    }

    private int calculateWordCount(String content) {
        if (content == null || content.isBlank()) {
            return 0;
        }
        String[] words = content.trim().split("\\s+");
        return (int) java.util.Arrays.stream(words)
                .filter(w -> !w.isBlank())
                .count();
    }

    private int calculateReadingTime(String content) {
        int wordCount = calculateWordCount(content);
        return Math.max(1, (int) Math.ceil(wordCount / 200.0));
    }
}
