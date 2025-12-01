package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.NoteAnalytics;
import be.asafarim.learn.javanotesapi.dto.StudyNoteRequest;
import be.asafarim.learn.javanotesapi.dto.StudyNoteResponse;
import be.asafarim.learn.javanotesapi.dto.VisibilityResponse;
import be.asafarim.learn.javanotesapi.entities.StudyNote;
import be.asafarim.learn.javanotesapi.entities.Tag;
import be.asafarim.learn.javanotesapi.entities.User;
import be.asafarim.learn.javanotesapi.enums.NoteVisibility;
import be.asafarim.learn.javanotesapi.repositories.StudyNoteRepository;
import be.asafarim.learn.javanotesapi.utils.PublicIdGenerator;
import be.asafarim.learn.javanotesapi.utils.SlugGenerator;
import org.springframework.beans.factory.annotation.Value;
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
    private final AttachmentService attachmentService;

    @Value("${app.base-url:http://localhost:5183}")
    private String baseUrl;

    public StudyNoteService(StudyNoteRepository repository, TagService tagService,
            AuthService authService, NoteViewService noteViewService,
            AttachmentService attachmentService) {
        this.repository = repository;
        this.tagService = tagService;
        this.authService = authService;
        this.noteViewService = noteViewService;
        this.attachmentService = attachmentService;
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
        
        // Force load the user to avoid lazy loading issues
        note.getUser().getUsername();
        
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

        // Generate slug from title
        String baseSlug = SlugGenerator.toSlug(req.getTitle());
        note.setSlug(ensureUniqueSlug(baseSlug, currentUser));

        // Generate unique publicId
        note.setPublicId(generateUniquePublicId());

        // Set default visibility
        note.setVisibility(req.isPublic() ? NoteVisibility.PUBLIC : NoteVisibility.PRIVATE);

        // Handle tags
        Set<Tag> tags = tagService.findOrCreateTags(req.getTags());
        note.setTags(tags);

        // Set academic metadata
        setAcademicMetadata(note, req, currentUser);

        repository.save(note);
        return toResponse(note);
    }
    
    private void setAcademicMetadata(StudyNote note, StudyNoteRequest req, User user) {
        // Use provided authors or fall back to current user's username
        if (req.getAuthors() != null && !req.getAuthors().isBlank()) {
            note.setAuthors(req.getAuthors());
        } else if (note.getAuthors() == null) {
            note.setAuthors(user.getUsername());
        }
        
        // Use provided year or current year as default
        if (req.getPublicationYear() != null) {
            note.setPublicationYear(req.getPublicationYear());
        } else if (note.getPublicationYear() == null) {
            note.setPublicationYear(java.time.Year.now().getValue());
        }
        
        if (req.getNoteType() != null) note.setNoteType(req.getNoteType());
        if (req.getCitationStyle() != null) note.setCitationStyle(req.getCitationStyle());
        if (req.getJournalName() != null) note.setJournalName(req.getJournalName());
        if (req.getPublisher() != null) note.setPublisher(req.getPublisher());
        if (req.getDoi() != null) note.setDoi(req.getDoi());
        if (req.getUrl() != null) note.setUrl(req.getUrl());
        if (req.getCitationKey() != null) note.setCitationKey(req.getCitationKey());
    }

    private String ensureUniqueSlug(String baseSlug, User user) {
        if (baseSlug == null || baseSlug.isEmpty()) {
            baseSlug = "note";
        }
        int attempt = 1;
        String slug = baseSlug;
        while (repository.existsByUserAndSlug(user, slug)) {
            slug = SlugGenerator.makeUnique(baseSlug, ++attempt);
        }
        return slug;
    }

    private String generateUniquePublicId() {
        String publicId;
        int maxAttempts = 10;
        int attempts = 0;
        do {
            publicId = PublicIdGenerator.generate();
            attempts++;
        } while (repository.existsByPublicId(publicId) && attempts < maxAttempts);
        return publicId;
    }

    @Transactional
    public StudyNoteResponse update(UUID id, StudyNoteRequest req) {
        User currentUser = authService.getCurrentUser();
        var note = repository.findById(id)
                .filter(n -> n.getUser().getId().equals(currentUser.getId()))
                .orElseThrow(() -> new RuntimeException("Note not found or you don't have permission to access it"));

        // Track visibility change
        boolean wasPublic = note.isPublic();
        boolean willBePublic = req.isPublic();

        note.setTitle(req.getTitle());
        note.setContent(req.getContent());
        note.setPublic(req.isPublic());

        // Update tags
        note.getTags().clear();
        Set<Tag> tags = tagService.findOrCreateTags(req.getTags());
        note.setTags(tags);

        // Update academic metadata
        setAcademicMetadata(note, req, currentUser);

        repository.save(note);

        // Sync attachment visibility: if note becomes private, make all attachments private
        if (wasPublic && !willBePublic) {
            attachmentService.makeAllPrivate(id);
        }

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
                n.getUser() != null ? n.getUser().getUsername() : "Unknown");
        
        // Set publicId for citations
        response.setPublicId(n.getPublicId());
        
        // Set academic metadata
        response.setAuthors(n.getAuthors());
        response.setPublicationYear(n.getPublicationYear());
        response.setNoteType(n.getNoteType() != null ? n.getNoteType().name() : null);
        response.setCitationStyle(n.getCitationStyle() != null ? n.getCitationStyle().name() : null);
        response.setJournalName(n.getJournalName());
        response.setPublisher(n.getPublisher());
        response.setDoi(n.getDoi());
        response.setUrl(n.getUrl());
        response.setCitationKey(n.getCitationKey());
        
        return response;
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

    // ============ Visibility Management ============

    /**
     * Get visibility status for a note
     */
    public VisibilityResponse getVisibility(UUID noteId) {
        User currentUser = authService.getCurrentUser();
        StudyNote note = repository.findById(noteId)
                .filter(n -> n.getUser().getId().equals(currentUser.getId()))
                .orElseThrow(() -> new RuntimeException("Note not found or you don't have permission"));
        return buildVisibilityResponse(note);
    }

    /**
     * Update visibility for a note
     */
    @Transactional
    public VisibilityResponse updateVisibility(UUID noteId, NoteVisibility newVisibility) {
        User currentUser = authService.getCurrentUser();
        StudyNote note = repository.findById(noteId)
                .filter(n -> n.getUser().getId().equals(currentUser.getId()))
                .orElseThrow(() -> new RuntimeException("Note not found or you don't have permission"));

        NoteVisibility oldVisibility = note.getVisibility();

        // If changing to PRIVATE, make all attachments private
        if (newVisibility == NoteVisibility.PRIVATE && oldVisibility != NoteVisibility.PRIVATE) {
            attachmentService.makeAllPrivate(noteId);
        }

        // Sync isPublic flag with visibility
        boolean isPublic = newVisibility == NoteVisibility.PUBLIC || 
                          newVisibility == NoteVisibility.FEATURED ||
                          newVisibility == NoteVisibility.UNLISTED;
        note.setPublic(isPublic);
        note.setVisibility(newVisibility);

        // Generate publicId if missing
        if (note.getPublicId() == null || note.getPublicId().isEmpty()) {
            note.setPublicId(generateUniquePublicId());
        }

        // Generate slug if missing
        if (note.getSlug() == null || note.getSlug().isEmpty()) {
            String baseSlug = SlugGenerator.toSlug(note.getTitle());
            note.setSlug(ensureUniqueSlug(baseSlug, currentUser));
        }

        repository.save(note);
        return buildVisibilityResponse(note);
    }

    /**
     * Update custom slug for a note
     */
    @Transactional
    public VisibilityResponse updateSlug(UUID noteId, String newSlug) {
        User currentUser = authService.getCurrentUser();
        StudyNote note = repository.findById(noteId)
                .filter(n -> n.getUser().getId().equals(currentUser.getId()))
                .orElseThrow(() -> new RuntimeException("Note not found or you don't have permission"));

        // Validate and normalize slug
        String normalizedSlug = SlugGenerator.toSlug(newSlug);
        if (normalizedSlug.isEmpty()) {
            throw new RuntimeException("Invalid slug");
        }

        // Check uniqueness (excluding current note)
        if (!normalizedSlug.equals(note.getSlug()) && repository.existsByUserAndSlug(currentUser, normalizedSlug)) {
            throw new RuntimeException("Slug already exists for another note");
        }

        note.setSlug(normalizedSlug);
        repository.save(note);
        return buildVisibilityResponse(note);
    }

    private VisibilityResponse buildVisibilityResponse(StudyNote note) {
        String publicUrl = String.format("%s/p/%s/%s", baseUrl, note.getPublicId(), note.getSlug());
        return new VisibilityResponse(
                note.getVisibility(),
                note.getSlug(),
                note.getPublicId(),
                publicUrl,
                publicUrl
        );
    }

    /**
     * Find note by publicId (for public access)
     */
    public StudyNote findByPublicId(String publicId) {
        return repository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
    }

    /**
     * Get note by ID without user check (for public access, visibility checked separately)
     */
    public StudyNote findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));
    }
}
