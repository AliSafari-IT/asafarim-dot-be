package be.asafarim.learn.javanotesapi.dto.citation;

import java.util.UUID;

/**
 * DTO representing a single formatted reference entry for the bibliography/references section.
 */
public class ReferenceEntryDto {
    private UUID referencedNoteId;
    private String publicId;
    private String label;        // "[1]" or "(1)" for numeric styles, empty for author-year
    private String formatted;    // Full reference string
    private String title;
    private String authors;
    private Integer year;
    private String noteType;

    public ReferenceEntryDto() {}

    public ReferenceEntryDto(UUID referencedNoteId, String publicId, String label, String formatted) {
        this.referencedNoteId = referencedNoteId;
        this.publicId = publicId;
        this.label = label;
        this.formatted = formatted;
    }

    // Getters and Setters
    public UUID getReferencedNoteId() { return referencedNoteId; }
    public void setReferencedNoteId(UUID referencedNoteId) { this.referencedNoteId = referencedNoteId; }

    public String getPublicId() { return publicId; }
    public void setPublicId(String publicId) { this.publicId = publicId; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getFormatted() { return formatted; }
    public void setFormatted(String formatted) { this.formatted = formatted; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthors() { return authors; }
    public void setAuthors(String authors) { this.authors = authors; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public String getNoteType() { return noteType; }
    public void setNoteType(String noteType) { this.noteType = noteType; }
}
