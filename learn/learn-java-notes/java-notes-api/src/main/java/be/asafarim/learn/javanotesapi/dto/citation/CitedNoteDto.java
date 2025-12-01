package be.asafarim.learn.javanotesapi.dto.citation;

import be.asafarim.learn.javanotesapi.entities.NoteCitation;
import be.asafarim.learn.javanotesapi.entities.StudyNote;
import be.asafarim.learn.javanotesapi.enums.NoteType;

import java.util.UUID;

/**
 * DTO representing a note that is cited by the current note.
 */
public class CitedNoteDto {
    private UUID citationId;
    private UUID noteId;
    private String publicId;
    private String title;
    private String authors;
    private Integer publicationYear;
    private NoteType noteType;
    private String citationKey;
    private Integer citationOrder;
    private String pageReference;
    private String inlineMarker;
    private String context;

    public static CitedNoteDto fromCitation(NoteCitation citation) {
        CitedNoteDto dto = new CitedNoteDto();
        dto.setCitationId(citation.getId());
        
        StudyNote ref = citation.getReferencedNote();
        dto.setNoteId(ref.getId());
        dto.setPublicId(ref.getPublicId());
        dto.setTitle(ref.getTitle());
        dto.setAuthors(ref.getAuthors());
        dto.setPublicationYear(ref.getPublicationYear());
        dto.setNoteType(ref.getNoteType());
        dto.setCitationKey(ref.getCitationKey());
        
        dto.setCitationOrder(citation.getCitationOrder());
        dto.setPageReference(citation.getPageReference());
        dto.setInlineMarker(citation.getInlineMarker());
        dto.setContext(citation.getContext());
        return dto;
    }

    // Getters and Setters
    public UUID getCitationId() { return citationId; }
    public void setCitationId(UUID citationId) { this.citationId = citationId; }

    public UUID getNoteId() { return noteId; }
    public void setNoteId(UUID noteId) { this.noteId = noteId; }

    public String getPublicId() { return publicId; }
    public void setPublicId(String publicId) { this.publicId = publicId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthors() { return authors; }
    public void setAuthors(String authors) { this.authors = authors; }

    public Integer getPublicationYear() { return publicationYear; }
    public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }

    public NoteType getNoteType() { return noteType; }
    public void setNoteType(NoteType noteType) { this.noteType = noteType; }

    public String getCitationKey() { return citationKey; }
    public void setCitationKey(String citationKey) { this.citationKey = citationKey; }

    public Integer getCitationOrder() { return citationOrder; }
    public void setCitationOrder(Integer citationOrder) { this.citationOrder = citationOrder; }

    public String getPageReference() { return pageReference; }
    public void setPageReference(String pageReference) { this.pageReference = pageReference; }

    public String getInlineMarker() { return inlineMarker; }
    public void setInlineMarker(String inlineMarker) { this.inlineMarker = inlineMarker; }

    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }
}
