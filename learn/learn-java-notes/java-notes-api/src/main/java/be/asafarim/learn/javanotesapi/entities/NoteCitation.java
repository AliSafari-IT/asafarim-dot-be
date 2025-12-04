package be.asafarim.learn.javanotesapi.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Junction entity linking StudyNotes to other StudyNotes (citations).
 * Creates a knowledge graph where notes can reference other notes.
 * Contains citation metadata including position, order, and page references.
 */
@Entity
@Table(name = "note_citations", indexes = {
    @Index(name = "idx_note_citation_note", columnList = "note_id"),
    @Index(name = "idx_note_citation_referenced", columnList = "referenced_note_id")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_note_citation", columnNames = {"note_id", "referenced_note_id"})
})
public class NoteCitation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * The note that contains the citation (citing note)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id", nullable = false)
    private StudyNote note;

    /**
     * The note being referenced/cited (cited note)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referenced_note_id", nullable = false)
    private StudyNote referencedNote;

    /**
     * Order number for numbered citation styles (e.g., [1], [2])
     */
    @Column(name = "citation_order")
    private Integer citationOrder;

    /**
     * Specific page(s) referenced in this citation (e.g., "p. 45" or "pp. 45-50")
     */
    @Column(name = "page_reference", length = 50)
    private String pageReference;

    /**
     * The inline citation marker used in the note content (e.g., "@smith2021", "[1]")
     */
    @Column(name = "inline_marker", length = 100)
    private String inlineMarker;

    /**
     * Context or quote from this source used in the note
     */
    @Column(columnDefinition = "TEXT")
    private String context;

    /**
     * Position in document where this citation first appears (character offset)
     */
    @Column(name = "first_position")
    private Integer firstPosition;

    /**
     * Number of times this note is cited in the citing note
     */
    @Column(name = "citation_count", nullable = false)
    private int citationCount = 1;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public NoteCitation() {}

    public NoteCitation(StudyNote note, StudyNote referencedNote, Integer citationOrder) {
        this.note = note;
        this.referencedNote = referencedNote;
        this.citationOrder = citationOrder;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public StudyNote getNote() { return note; }
    public void setNote(StudyNote note) { this.note = note; }

    public StudyNote getReferencedNote() { return referencedNote; }
    public void setReferencedNote(StudyNote referencedNote) { this.referencedNote = referencedNote; }

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
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
