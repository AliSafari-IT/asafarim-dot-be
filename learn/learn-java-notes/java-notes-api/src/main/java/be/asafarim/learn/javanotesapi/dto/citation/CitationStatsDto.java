package be.asafarim.learn.javanotesapi.dto.citation;

import java.util.UUID;

/**
 * DTO for citation statistics of a note.
 */
public class CitationStatsDto {
    private UUID noteId;
    private long outgoingCitations;  // How many notes this note cites
    private long incomingCitations;  // How many notes cite this note

    public CitationStatsDto() {}

    public CitationStatsDto(UUID noteId, long outgoingCitations, long incomingCitations) {
        this.noteId = noteId;
        this.outgoingCitations = outgoingCitations;
        this.incomingCitations = incomingCitations;
    }

    // Getters and Setters
    public UUID getNoteId() { return noteId; }
    public void setNoteId(UUID noteId) { this.noteId = noteId; }

    public long getOutgoingCitations() { return outgoingCitations; }
    public void setOutgoingCitations(long outgoingCitations) { this.outgoingCitations = outgoingCitations; }

    public long getIncomingCitations() { return incomingCitations; }
    public void setIncomingCitations(long incomingCitations) { this.incomingCitations = incomingCitations; }
}
