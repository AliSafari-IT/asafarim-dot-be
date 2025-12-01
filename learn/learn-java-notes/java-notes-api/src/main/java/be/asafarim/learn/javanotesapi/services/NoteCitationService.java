package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.citation.*;
import be.asafarim.learn.javanotesapi.entities.NoteCitation;
import be.asafarim.learn.javanotesapi.entities.StudyNote;
import be.asafarim.learn.javanotesapi.entities.User;
import be.asafarim.learn.javanotesapi.enums.CitationStyle;
import be.asafarim.learn.javanotesapi.repositories.NoteCitationRepository;
import be.asafarim.learn.javanotesapi.repositories.StudyNoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing note-to-note citations in the knowledge graph.
 */
@Service
@Transactional
public class NoteCitationService {

    @Autowired
    private NoteCitationRepository citationRepository;

    @Autowired
    private StudyNoteRepository noteRepository;

    @Autowired
    private AuthService authService;

    // ==================== Citation CRUD ====================

    /**
     * Create a citation from one note to another
     */
    public NoteCitationDto createCitation(UUID noteId, UUID referencedNoteId, CreateCitationRequest request) {
        User user = authService.getCurrentUser();

        StudyNote note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found: " + noteId));

        if (!note.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: you don't own this note");
        }

        StudyNote referencedNote = noteRepository.findById(referencedNoteId)
                .orElseThrow(() -> new RuntimeException("Referenced note not found: " + referencedNoteId));

        // Prevent self-citation
        if (noteId.equals(referencedNoteId)) {
            throw new RuntimeException("A note cannot cite itself");
        }

        // Check if citation already exists
        if (citationRepository.existsByNoteIdAndReferencedNoteId(noteId, referencedNoteId)) {
            throw new RuntimeException("Citation already exists");
        }

        // Get next citation order
        Integer maxOrder = citationRepository.getMaxCitationOrder(noteId);
        int nextOrder = (maxOrder != null ? maxOrder : 0) + 1;

        NoteCitation citation = new NoteCitation(note, referencedNote, nextOrder);
        citation.setPageReference(request.getPageReference());
        citation.setInlineMarker(request.getInlineMarker());
        citation.setContext(request.getContext());
        citation.setFirstPosition(request.getFirstPosition());
        citation.setCitationCount(request.getCitationCount() != null ? request.getCitationCount() : 1);

        NoteCitation saved = citationRepository.save(citation);
        return NoteCitationDto.fromEntity(saved);
    }

    /**
     * Update citation metadata
     */
    public NoteCitationDto updateCitation(UUID citationId, UpdateCitationRequest request) {
        User user = authService.getCurrentUser();

        NoteCitation citation = citationRepository.findById(citationId)
                .orElseThrow(() -> new RuntimeException("Citation not found"));

        if (!citation.getNote().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        if (request.getPageReference() != null) {
            citation.setPageReference(request.getPageReference());
        }
        if (request.getInlineMarker() != null) {
            citation.setInlineMarker(request.getInlineMarker());
        }
        if (request.getContext() != null) {
            citation.setContext(request.getContext());
        }
        if (request.getFirstPosition() != null) {
            citation.setFirstPosition(request.getFirstPosition());
        }
        if (request.getCitationCount() != null) {
            citation.setCitationCount(request.getCitationCount());
        }

        NoteCitation saved = citationRepository.save(citation);
        return NoteCitationDto.fromEntity(saved);
    }

    /**
     * Delete a citation
     */
    public void deleteCitation(UUID citationId) {
        User user = authService.getCurrentUser();

        NoteCitation citation = citationRepository.findById(citationId)
                .orElseThrow(() -> new RuntimeException("Citation not found"));

        if (!citation.getNote().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        citationRepository.delete(citation);
    }

    /**
     * Delete a citation by note and referenced note IDs
     */
    public void deleteCitationByNotes(UUID noteId, UUID referencedNoteId) {
        User user = authService.getCurrentUser();

        NoteCitation citation = citationRepository.findByNoteIdAndReferencedNoteId(noteId, referencedNoteId)
                .orElseThrow(() -> new RuntimeException("Citation not found"));

        if (!citation.getNote().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        citationRepository.delete(citation);
    }

    // ==================== Query Operations ====================

    /**
     * Get all outgoing citations from a note
     */
    @Transactional(readOnly = true)
    public List<NoteCitationDto> getOutgoingCitations(UUID noteId) {
        return citationRepository.findByNoteIdOrderByCitationOrderAsc(noteId).stream()
                .map(NoteCitationDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all incoming citations to a note (notes that cite this note)
     */
    @Transactional(readOnly = true)
    public List<NoteCitationDto> getIncomingCitations(UUID noteId) {
        return citationRepository.findByReferencedNoteIdOrderByCreatedAtDesc(noteId).stream()
                .map(NoteCitationDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get cited notes (notes referenced by a note)
     */
    @Transactional(readOnly = true)
    public List<CitedNoteDto> getCitedNotes(UUID noteId) {
        List<NoteCitation> citations = citationRepository.findByNoteIdOrderByCitationOrderAsc(noteId);
        return citations.stream()
                .map(c -> CitedNoteDto.fromCitation(c))
                .collect(Collectors.toList());
    }

    /**
     * Get citing notes (notes that reference this note)
     */
    @Transactional(readOnly = true)
    public List<CitingNoteDto> getCitingNotes(UUID noteId) {
        List<NoteCitation> citations = citationRepository.findByReferencedNoteIdOrderByCreatedAtDesc(noteId);
        return citations.stream()
                .map(c -> CitingNoteDto.fromCitation(c))
                .collect(Collectors.toList());
    }

    // ==================== Citation Order Management ====================

    /**
     * Reorder citations
     */
    public void reorderCitations(UUID noteId, List<UUID> citationIds) {
        User user = authService.getCurrentUser();

        StudyNote note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (!note.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        for (int i = 0; i < citationIds.size(); i++) {
            citationRepository.updateCitationOrder(citationIds.get(i), i + 1);
        }
    }

    // ==================== Citation Formatting ====================

    /**
     * Format inline citation based on style
     */
    public String formatInlineCitation(StudyNote referencedNote, CitationStyle style, Integer order) {
        List<String> authors = parseAuthors(referencedNote.getAuthors());
        String firstAuthor = authors.isEmpty() ? referencedNote.getTitle().split(" ")[0] : getLastName(authors.get(0));
        Integer year = referencedNote.getPublicationYear();

        return switch (style) {
            case APA, HARVARD -> String.format("(%s, %s)", firstAuthor, year != null ? year : "n.d.");
            case MLA -> String.format("(%s)", firstAuthor);
            case IEEE, VANCOUVER -> String.format("[%d]", order != null ? order : 1);
            case CHICAGO -> String.format("(%s %s)", firstAuthor, year != null ? year : "n.d.");
            case BIBTEX -> String.format("\\cite{%s}", 
                referencedNote.getCitationKey() != null ? referencedNote.getCitationKey() : referencedNote.getId().toString().substring(0, 8));
        };
    }

    /**
     * Format full reference for bibliography section
     */
    public String formatFullReference(StudyNote note, CitationStyle style, Integer order) {
        List<String> authors = parseAuthors(note.getAuthors());
        String authorStr = formatAuthors(authors);
        String title = note.getTitle();
        Integer year = note.getPublicationYear();
        String yearStr = year != null ? String.valueOf(year) : "n.d.";

        return switch (style) {
            case APA -> String.format("%s (%s). %s. %s", authorStr, yearStr, title,
                    note.getPublisher() != null ? note.getPublisher() : "");
            case MLA -> String.format("%s. \"%s.\" %s, %s.", authorStr, title,
                    note.getPublisher() != null ? note.getPublisher() : "", yearStr);
            case IEEE -> String.format("[%d] %s, \"%s,\" %s, %s.", order, authorStr, title,
                    note.getPublisher() != null ? note.getPublisher() : "", yearStr);
            case CHICAGO -> String.format("%s. %s. %s, %s.", authorStr, title,
                    note.getPublisher() != null ? note.getPublisher() : "", yearStr);
            case HARVARD -> String.format("%s (%s) %s. %s.", authorStr, yearStr, title,
                    note.getPublisher() != null ? note.getPublisher() : "");
            case VANCOUVER -> String.format("%d. %s. %s. %s; %s.", order, authorStr, title,
                    note.getPublisher() != null ? note.getPublisher() : "", yearStr);
            case BIBTEX -> formatBibTeX(note);
        };
    }

    private String formatBibTeX(StudyNote note) {
        StringBuilder sb = new StringBuilder();
        String type = note.getNoteType() != null ? 
            switch (note.getNoteType()) {
                case PAPER -> "article";
                case RESEARCH -> "techreport";
                case ARTICLE -> "article";
                default -> "misc";
            } : "misc";

        String key = note.getCitationKey() != null ? note.getCitationKey() : 
                     note.getId().toString().substring(0, 8);

        sb.append("@").append(type).append("{").append(key).append(",\n");
        sb.append("  title = {").append(note.getTitle()).append("},\n");
        if (note.getAuthors() != null) sb.append("  author = {").append(note.getAuthors()).append("},\n");
        if (note.getPublicationYear() != null) sb.append("  year = {").append(note.getPublicationYear()).append("},\n");
        if (note.getPublisher() != null) sb.append("  publisher = {").append(note.getPublisher()).append("},\n");
        if (note.getUrl() != null) sb.append("  url = {").append(note.getUrl()).append("},\n");
        sb.append("}");
        return sb.toString();
    }

    // ==================== Statistics ====================

    /**
     * Get citation statistics for a note
     */
    @Transactional(readOnly = true)
    public CitationStatsDto getCitationStats(UUID noteId) {
        long outgoingCount = citationRepository.countByNoteId(noteId);
        long incomingCount = citationRepository.countByReferencedNoteId(noteId);

        return new CitationStatsDto(noteId, outgoingCount, incomingCount);
    }

    // ==================== Helper Methods ====================

    private List<String> parseAuthors(String json) {
        if (json == null || json.isEmpty()) return List.of();
        String cleaned = json.replace("[", "").replace("]", "").replace("\"", "");
        if (cleaned.isEmpty()) return List.of();
        return Arrays.stream(cleaned.split(",")).map(String::trim).toList();
    }

    private String getLastName(String fullName) {
        if (fullName == null) return "";
        String[] parts = fullName.trim().split(" ");
        return parts[parts.length - 1];
    }

    private String formatAuthors(List<String> authors) {
        if (authors.isEmpty()) return "Unknown";
        if (authors.size() == 1) return authors.get(0);
        if (authors.size() == 2) return authors.get(0) + " & " + authors.get(1);
        return authors.get(0) + " et al.";
    }
}
