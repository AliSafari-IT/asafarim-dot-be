package be.asafarim.learn.javanotesapi.enums;

/**
 * Defines the hierarchy of note types from simple to full academic papers.
 */
public enum NoteType {
    /**
     * Simple Note: Plain text or markdown, optional tags/attachments, no citations.
     */
    SIMPLE("Simple Note", "Basic note with markdown support"),
    
    /**
     * Extended Note: Markdown with sections, code blocks, internal references.
     */
    EXTENDED("Extended Note", "Structured note with sections and code blocks"),
    
    /**
     * Code Snippet: Focused on code with syntax highlighting and explanations.
     */
    CODE_SNIPPET("Code Snippet", "Code-focused note with syntax highlighting"),
    
    /**
     * Tutorial: Step-by-step instructional content with prerequisites and outcomes.
     */
    TUTORIAL("Tutorial", "Step-by-step instructional content"),
    
    /**
     * Technical Documentation: API docs, specifications, or technical references.
     */
    TECHNICAL_DOC("Technical Documentation", "API documentation or technical specifications"),
    
    /**
     * Research Note: Extended note with sources section and citation markers.
     */
    RESEARCH("Research Note", "Note with citations and sources"),
    
    /**
     * Article: Blog-style article with introduction, body, and conclusion.
     */
    ARTICLE("Article", "Blog-style article with structured sections"),
    
    /**
     * Full Paper: Academic-style document with abstract, keywords, sections, and references.
     */
    PAPER("Academic Paper", "Full academic paper with bibliography");

    private final String displayName;
    private final String description;

    NoteType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
