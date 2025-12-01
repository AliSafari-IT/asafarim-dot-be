package be.asafarim.learn.javanotesapi.dto.citation;

import be.asafarim.learn.javanotesapi.entities.NoteCitation;
import be.asafarim.learn.javanotesapi.entities.StudyNote;
import be.asafarim.learn.javanotesapi.enums.NoteType;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO representing a note that cites the current note.
 */
public class CitingNoteDto {
    private UUID citationId;
    private UUID noteId;
    private String title;
    private String authors;
    private NoteType noteType;
    private String context;
    private LocalDateTime citedAt;

    public static CitingNoteDto fromCitation(NoteCitation citation) {
        CitingNoteDto dto = new CitingNoteDto();
        dto.setCitationId(citation.getId());
        
        StudyNote citingNote = citation.getNote();
        dto.setNoteId(citingNote.getId());
        dto.setTitle(citingNote.getTitle());
        dto.setAuthors(citingNote.getAuthors());
        dto.setNoteType(citingNote.getNoteType());
        
        dto.setContext(citation.getContext());
        dto.setCitedAt(citation.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public UUID getCitationId() { return citationId; }
    public void setCitationId(UUID citationId) { this.citationId = citationId; }

    public UUID getNoteId() { return noteId; }
    public void setNoteId(UUID noteId) { this.noteId = noteId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthors() { return authors; }
    public void setAuthors(String authors) { this.authors = authors; }

    public NoteType getNoteType() { return noteType; }
    public void setNoteType(NoteType noteType) { this.noteType = noteType; }

    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }

    public LocalDateTime getCitedAt() { return citedAt; }
    public void setCitedAt(LocalDateTime citedAt) { this.citedAt = citedAt; }
}
