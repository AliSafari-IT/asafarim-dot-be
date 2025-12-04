package be.asafarim.learn.javanotesapi.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class StudyNoteResponse {
    private UUID id;
    private String publicId;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int readingTimeMinutes;
    private int wordCount;
    private boolean isPublic;
    private List<String> tags;
    private String createdBy;
    
    // Academic metadata fields
    private String authors;
    private Integer publicationYear;
    private String noteType;
    private String citationStyle;
    private String journalName;
    private String publisher;
    private String doi;
    private String url;
    private String citationKey;
    
    // Analytics fields
    private NoteAnalytics analytics;

    public StudyNoteResponse(UUID id, String title, String content,
                             LocalDateTime createdAt, LocalDateTime updatedAt,
                             int readingTimeMinutes, int wordCount,
                             boolean isPublic, List<String> tags, String createdBy) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.readingTimeMinutes = readingTimeMinutes;
        this.wordCount = wordCount;
        this.isPublic = isPublic;
        this.tags = tags != null ? tags : new ArrayList<>();
        this.createdBy = createdBy;
    }

    public StudyNoteResponse(UUID id, String title, String content,
                             LocalDateTime createdAt, LocalDateTime updatedAt,
                             int readingTimeMinutes, int wordCount,
                             boolean isPublic, List<String> tags, String createdBy,
                             NoteAnalytics analytics) {
        this(id, title, content, createdAt, updatedAt, readingTimeMinutes, wordCount, isPublic, tags, createdBy);
        this.analytics = analytics;
    }

    public UUID getId() { return id; }
    public String getPublicId() { return publicId; }
    public void setPublicId(String publicId) { this.publicId = publicId; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public int getReadingTimeMinutes() { return readingTimeMinutes; }
    public int getWordCount() { return wordCount; }
    public boolean isPublic() { return isPublic; }
    
    public boolean getIsPublic() { return isPublic; }
    public List<String> getTags() { return tags; }
    public String getCreatedBy() { return createdBy; }
    
    public NoteAnalytics getAnalytics() { return analytics; }
    public void setAnalytics(NoteAnalytics analytics) { this.analytics = analytics; }
    
    // Academic metadata getters/setters
    public String getAuthors() { return authors; }
    public void setAuthors(String authors) { this.authors = authors; }
    
    public Integer getPublicationYear() { return publicationYear; }
    public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }
    
    public String getNoteType() { return noteType; }
    public void setNoteType(String noteType) { this.noteType = noteType; }
    
    public String getCitationStyle() { return citationStyle; }
    public void setCitationStyle(String citationStyle) { this.citationStyle = citationStyle; }
    
    public String getJournalName() { return journalName; }
    public void setJournalName(String journalName) { this.journalName = journalName; }
    
    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }
    
    public String getDoi() { return doi; }
    public void setDoi(String doi) { this.doi = doi; }
    
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    
    public String getCitationKey() { return citationKey; }
    public void setCitationKey(String citationKey) { this.citationKey = citationKey; }
}
