package be.asafarim.learn.javanotesapi.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class StudyNoteResponse {
    private UUID id;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int readingTimeMinutes;
    private int wordCount;
    private boolean isPublic;
    private List<String> tags;
    
    // Analytics fields
    private NoteAnalytics analytics;

    public StudyNoteResponse(UUID id, String title, String content,
                             LocalDateTime createdAt, LocalDateTime updatedAt,
                             int readingTimeMinutes, int wordCount,
                             boolean isPublic, List<String> tags) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.readingTimeMinutes = readingTimeMinutes;
        this.wordCount = wordCount;
        this.isPublic = isPublic;
        this.tags = tags != null ? tags : new ArrayList<>();
    }

    public StudyNoteResponse(UUID id, String title, String content,
                             LocalDateTime createdAt, LocalDateTime updatedAt,
                             int readingTimeMinutes, int wordCount,
                             boolean isPublic, List<String> tags,
                             NoteAnalytics analytics) {
        this(id, title, content, createdAt, updatedAt, readingTimeMinutes, wordCount, isPublic, tags);
        this.analytics = analytics;
    }

    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public int getReadingTimeMinutes() { return readingTimeMinutes; }
    public int getWordCount() { return wordCount; }
    public boolean isPublic() { return isPublic; }
    
    public boolean getIsPublic() { return isPublic; }
    public List<String> getTags() { return tags; }
    
    public NoteAnalytics getAnalytics() { return analytics; }
    public void setAnalytics(NoteAnalytics analytics) { this.analytics = analytics; }
}
