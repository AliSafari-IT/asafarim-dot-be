package be.asafarim.learn.javanotesapi.dto.citation;

import be.asafarim.learn.javanotesapi.entities.NoteCitation;
import be.asafarim.learn.javanotesapi.entities.StudyNote;
import be.asafarim.learn.javanotesapi.enums.NoteType;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for NoteCitation entity.
 */
public class NoteCitationDto {
    private UUID id;
    private UUID noteId;
    private String noteTitle;
    private UUID referencedNoteId;
    private String referencedNoteTitle;
    private NoteType referencedNoteType;
    private String referencedNoteAuthors;
    private Integer referencedNoteYear;
    private Integer citationOrder;
    private String pageReference;
    private String inlineMarker;
    private String context;
    private Integer firstPosition;
    private int citationCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static NoteCitationDto fromEntity(NoteCitation citation) {
        NoteCitationDto dto = new NoteCitationDto();
        dto.setId(citation.getId());
        dto.setNoteId(citation.getNote().getId());
        dto.setNoteTitle(citation.getNote().getTitle());
        
        StudyNote ref = citation.getReferencedNote();
        dto.setReferencedNoteId(ref.getId());
        dto.setReferencedNoteTitle(ref.getTitle());
        dto.setReferencedNoteType(ref.getNoteType());
        dto.setReferencedNoteAuthors(ref.getAuthors());
        dto.setReferencedNoteYear(ref.getPublicationYear());
        
        dto.setCitationOrder(citation.getCitationOrder());
        dto.setPageReference(citation.getPageReference());
        dto.setInlineMarker(citation.getInlineMarker());
        dto.setContext(citation.getContext());
        dto.setFirstPosition(citation.getFirstPosition());
        dto.setCitationCount(citation.getCitationCount());
        dto.setCreatedAt(citation.getCreatedAt());
        dto.setUpdatedAt(citation.getUpdatedAt());
        return dto;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getNoteId() { return noteId; }
    public void setNoteId(UUID noteId) { this.noteId = noteId; }

    public String getNoteTitle() { return noteTitle; }
    public void setNoteTitle(String noteTitle) { this.noteTitle = noteTitle; }

    public UUID getReferencedNoteId() { return referencedNoteId; }
    public void setReferencedNoteId(UUID referencedNoteId) { this.referencedNoteId = referencedNoteId; }

    public String getReferencedNoteTitle() { return referencedNoteTitle; }
    public void setReferencedNoteTitle(String referencedNoteTitle) { this.referencedNoteTitle = referencedNoteTitle; }

    public NoteType getReferencedNoteType() { return referencedNoteType; }
    public void setReferencedNoteType(NoteType referencedNoteType) { this.referencedNoteType = referencedNoteType; }

    public String getReferencedNoteAuthors() { return referencedNoteAuthors; }
    public void setReferencedNoteAuthors(String referencedNoteAuthors) { this.referencedNoteAuthors = referencedNoteAuthors; }

    public Integer getReferencedNoteYear() { return referencedNoteYear; }
    public void setReferencedNoteYear(Integer referencedNoteYear) { this.referencedNoteYear = referencedNoteYear; }

    public Integer getCitationOrder() { return citationOrder; }
    public void setCitationOrder(Integer citationOrder) { this.citationOrder = citationOrder; }

    public String getPageReference() { return pageReference; }
    public void setPageReference(String pageReference) { this.pageReference = pageReference; }

    public String getInlineMarker() { return inlineMarker; }
    public void setInlineMarker(String inlineMarker) { this.inlineMarker = inlineMarker; }

    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }

    public Integer getFirstPosition() { return firstPosition; }
    public void setFirstPosition(Integer firstPosition) { this.firstPosition = firstPosition; }

    public int getCitationCount() { return citationCount; }
    public void setCitationCount(int citationCount) { this.citationCount = citationCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
