package be.asafarim.learn.javanotesapi.dto.citation;

import be.asafarim.learn.javanotesapi.enums.CitationStyle;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO containing the rendered citation output for a note.
 * Used by the frontend to display inline citations and reference lists.
 */
public class CitationRenderResult {
    private UUID noteId;
    private CitationStyle style;
    private String processedMarkdown;  // Markdown with citation tokens (or placeholders)
    private Map<String, String> inlineLabels;  // publicId -> human label like "[1]" or "(Smith, 2021)"
    private List<ReferenceEntryDto> references;  // Ordered reference entries
    private List<String> warnings;  // Any issues found (dangling markers, etc.)

    public CitationRenderResult() {}

    public CitationRenderResult(UUID noteId, CitationStyle style) {
        this.noteId = noteId;
        this.style = style;
    }

    // Getters and Setters
    public UUID getNoteId() { return noteId; }
    public void setNoteId(UUID noteId) { this.noteId = noteId; }

    public CitationStyle getStyle() { return style; }
    public void setStyle(CitationStyle style) { this.style = style; }

    public String getProcessedMarkdown() { return processedMarkdown; }
    public void setProcessedMarkdown(String processedMarkdown) { this.processedMarkdown = processedMarkdown; }

    public Map<String, String> getInlineLabels() { return inlineLabels; }
    public void setInlineLabels(Map<String, String> inlineLabels) { this.inlineLabels = inlineLabels; }

    public List<ReferenceEntryDto> getReferences() { return references; }
    public void setReferences(List<ReferenceEntryDto> references) { this.references = references; }

    public List<String> getWarnings() { return warnings; }
    public void setWarnings(List<String> warnings) { this.warnings = warnings; }
}
