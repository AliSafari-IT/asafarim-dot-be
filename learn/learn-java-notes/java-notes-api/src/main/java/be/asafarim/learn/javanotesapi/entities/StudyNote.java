package be.asafarim.learn.javanotesapi.entities;

import be.asafarim.learn.javanotesapi.enums.CitationStyle;
import be.asafarim.learn.javanotesapi.enums.NoteType;
import be.asafarim.learn.javanotesapi.enums.NoteVisibility;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "study_notes")
public class StudyNote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;

    /**
     * Subtitle for articles and papers
     */
    private String subtitle;

    @Column(columnDefinition = "TEXT")
    private String content;

    /**
     * Abstract for research notes and papers
     */
    @Column(name = "abstract_text", columnDefinition = "TEXT")
    private String abstractText;

    /**
     * Keywords for papers (stored as JSON array)
     */
    @Column(columnDefinition = "TEXT")
    private String keywords;

    /**
     * Type of note: SIMPLE, EXTENDED, CODE_SNIPPET, TUTORIAL, TECHNICAL_DOC, RESEARCH, ARTICLE, PAPER
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "note_type", length = 20)
    private NoteType noteType = NoteType.SIMPLE;

    /**
     * Preferred citation style for this note
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "citation_style", length = 20)
    private CitationStyle citationStyle = CitationStyle.APA;

    private int readingTimeMinutes;

    private int wordCount;

    @Column(nullable = false)
    private boolean isPublic = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NoteVisibility visibility = NoteVisibility.PRIVATE;

    @Column(columnDefinition = "TEXT")
    private String slug;

    @Column(name = "public_id", length = 20)
    private String publicId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.EAGER)
    @JoinTable(
        name = "study_note_tags",
        joinColumns = @JoinColumn(name = "study_note_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    // ==================== Citation Relationships (Knowledge Graph) ====================

    /**
     * Outgoing citations: Notes that THIS note references/cites
     */
    @OneToMany(mappedBy = "note", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("citationOrder ASC")
    private Set<NoteCitation> citations = new HashSet<>();

    /**
     * Incoming citations: Other notes that cite THIS note
     */
    @OneToMany(mappedBy = "referencedNote", fetch = FetchType.LAZY)
    private Set<NoteCitation> citedBy = new HashSet<>();

    // ==================== Academic/Publication Metadata ====================

    /**
     * Authors (stored as JSON array for multiple authors)
     */
    @Column(columnDefinition = "TEXT")
    private String authors;

    /**
     * Publication year
     */
    @Column(name = "publication_year")
    private Integer publicationYear;

    /**
     * Journal or publication name
     */
    @Column(name = "journal_name")
    private String journalName;

    /**
     * Publisher
     */
    private String publisher;

    /**
     * Page numbers (e.g., "45-67")
     */
    private String pages;

    /**
     * Digital Object Identifier
     */
    @Column(length = 100)
    private String doi;

    /**
     * External URL reference
     */
    @Column(length = 500)
    private String url;

    /**
     * ISBN for books
     */
    @Column(length = 20)
    private String isbn;

    /**
     * ISSN for journals
     */
    @Column(length = 20)
    private String issn;

    /**
     * Edition (for books)
     */
    @Column(length = 50)
    private String edition;

    /**
     * Volume number
     */
    @Column(length = 20)
    private String volume;

    /**
     * Issue number
     */
    @Column(length = 20)
    private String issue;

    /**
     * Date when URL was last accessed
     */
    @Column(name = "accessed_date")
    private LocalDateTime accessedDate;

    /**
     * Citation key for referencing (e.g., "smith2021")
     */
    @Column(name = "citation_key", length = 100)
    private String citationKey;

    /**
     * Mark as favorite/starred
     */
    @Column(nullable = false)
    private boolean favorite = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public StudyNote() {}

    public StudyNote(String title, String content, User user) {
        this.title = title;
        this.content = content;
        this.user = user;
    }

    // getters and setters
    public UUID getId() { return id; }

    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }

    public void setContent(String content) { this.content = content; }

    public int getReadingTimeMinutes() { return readingTimeMinutes; }

    public void setReadingTimeMinutes(int readingTimeMinutes) { this.readingTimeMinutes = readingTimeMinutes; }

    public int getWordCount() { return wordCount; }

    public void setWordCount(int wordCount) { this.wordCount = wordCount; }

    public boolean isPublic() { return isPublic; }

    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public User getUser() { return user; }

    public void setUser(User user) { this.user = user; }

    public Set<Tag> getTags() { return tags; }

    public void setTags(Set<Tag> tags) { this.tags = tags; }

    // Citation getters/setters
    public Set<NoteCitation> getCitations() { return citations; }
    public void setCitations(Set<NoteCitation> citations) { this.citations = citations; }

    public Set<NoteCitation> getCitedBy() { return citedBy; }
    public void setCitedBy(Set<NoteCitation> citedBy) { this.citedBy = citedBy; }

    // Academic metadata getters/setters
    public String getAuthors() { return authors; }
    public void setAuthors(String authors) { this.authors = authors; }

    public Integer getPublicationYear() { return publicationYear; }
    public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }

    public String getJournalName() { return journalName; }
    public void setJournalName(String journalName) { this.journalName = journalName; }

    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }

    public String getPages() { return pages; }
    public void setPages(String pages) { this.pages = pages; }

    public String getDoi() { return doi; }
    public void setDoi(String doi) { this.doi = doi; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public String getIssn() { return issn; }
    public void setIssn(String issn) { this.issn = issn; }

    public String getEdition() { return edition; }
    public void setEdition(String edition) { this.edition = edition; }

    public String getVolume() { return volume; }
    public void setVolume(String volume) { this.volume = volume; }

    public String getIssue() { return issue; }
    public void setIssue(String issue) { this.issue = issue; }

    public LocalDateTime getAccessedDate() { return accessedDate; }
    public void setAccessedDate(LocalDateTime accessedDate) { this.accessedDate = accessedDate; }

    public String getCitationKey() { return citationKey; }
    public void setCitationKey(String citationKey) { this.citationKey = citationKey; }

    public boolean isFavorite() { return favorite; }
    public void setFavorite(boolean favorite) { this.favorite = favorite; }

    public String getSubtitle() { return subtitle; }

    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }

    public String getAbstractText() { return abstractText; }

    public void setAbstractText(String abstractText) { this.abstractText = abstractText; }

    public String getKeywords() { return keywords; }

    public void setKeywords(String keywords) { this.keywords = keywords; }

    public NoteType getNoteType() { return noteType; }

    public void setNoteType(NoteType noteType) { this.noteType = noteType; }

    public CitationStyle getCitationStyle() { return citationStyle; }

    public void setCitationStyle(CitationStyle citationStyle) { this.citationStyle = citationStyle; }

    public NoteVisibility getVisibility() { return visibility; }

    public void setVisibility(NoteVisibility visibility) { this.visibility = visibility; }

    public String getSlug() { return slug; }

    public void setSlug(String slug) { this.slug = slug; }

    public String getPublicId() { return publicId; }

    public void setPublicId(String publicId) { this.publicId = publicId; }

    public void addTag(Tag tag) {
        this.tags.add(tag);
        tag.getNotes().add(this);
    }

    public void removeTag(Tag tag) {
        this.tags.remove(tag);
        tag.getNotes().remove(this);
    }

    public void clearTags() {
        for (Tag tag : new HashSet<>(this.tags)) {
            removeTag(tag);
        }
    }
}
