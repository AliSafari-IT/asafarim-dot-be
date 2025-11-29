package be.asafarim.learn.javanotesapi.dto;

import be.asafarim.learn.javanotesapi.enums.NoteVisibility;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class PublicNoteResponse {
    private UUID id;
    private String publicId;
    private String slug;
    private String title;
    private String content;
    private String excerpt;
    private List<String> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int readingTimeMinutes;
    private int wordCount;
    private NoteVisibility visibility;
    private String authorDisplayName;
    private boolean hasPublicAttachments;
    private long viewCount;

    public PublicNoteResponse() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getPublicId() { return publicId; }
    public void setPublicId(String publicId) { this.publicId = publicId; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public int getReadingTimeMinutes() { return readingTimeMinutes; }
    public void setReadingTimeMinutes(int readingTimeMinutes) { this.readingTimeMinutes = readingTimeMinutes; }

    public int getWordCount() { return wordCount; }
    public void setWordCount(int wordCount) { this.wordCount = wordCount; }

    public NoteVisibility getVisibility() { return visibility; }
    public void setVisibility(NoteVisibility visibility) { this.visibility = visibility; }

    public String getAuthorDisplayName() { return authorDisplayName; }
    public void setAuthorDisplayName(String authorDisplayName) { this.authorDisplayName = authorDisplayName; }

    public boolean isHasPublicAttachments() { return hasPublicAttachments; }
    public void setHasPublicAttachments(boolean hasPublicAttachments) { this.hasPublicAttachments = hasPublicAttachments; }

    public long getViewCount() { return viewCount; }
    public void setViewCount(long viewCount) { this.viewCount = viewCount; }
}
