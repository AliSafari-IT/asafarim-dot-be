package be.asafarim.learn.javanotesapi.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class StudyNoteResponse {
    private Long id;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int readingTimeMinutes;
    private int wordCount;
    private List<String> tags;

    public StudyNoteResponse(Long id, String title, String content,
                             LocalDateTime createdAt, LocalDateTime updatedAt,
                             int readingTimeMinutes, int wordCount,
                             List<String> tags) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.readingTimeMinutes = readingTimeMinutes;
        this.wordCount = wordCount;
        this.tags = tags != null ? tags : new ArrayList<>();
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public int getReadingTimeMinutes() { return readingTimeMinutes; }
    public int getWordCount() { return wordCount; }
    public List<String> getTags() { return tags; }
}
