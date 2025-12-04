package be.asafarim.learn.javanotesapi.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO representing a single search result with ranking metadata
 */
public class SearchHit {
    private UUID id;
    private String title;
    private String contentPreview;
    private List<String> matchedTags;
    private List<String> allTags;
    private int attachmentCount;
    private boolean isPublic;
    private double relevanceScore;
    private long viewCount;
    private Instant createdAt;
    private Instant updatedAt;
    private List<HighlightMatch> highlights;

    public SearchHit() {}

    public SearchHit(UUID id, String title, String contentPreview) {
        this.id = id;
        this.title = title;
        this.contentPreview = contentPreview;
    }

    // Nested class for highlight matches
    public static class HighlightMatch {
        private String field;
        private String text;
        private int startIndex;
        private int endIndex;

        public HighlightMatch() {}

        public HighlightMatch(String field, String text, int startIndex, int endIndex) {
            this.field = field;
            this.text = text;
            this.startIndex = startIndex;
            this.endIndex = endIndex;
        }

        public String getField() { return field; }
        public void setField(String field) { this.field = field; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        public int getStartIndex() { return startIndex; }
        public void setStartIndex(int startIndex) { this.startIndex = startIndex; }
        public int getEndIndex() { return endIndex; }
        public void setEndIndex(int endIndex) { this.endIndex = endIndex; }
    }

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContentPreview() {
        return contentPreview;
    }

    public void setContentPreview(String contentPreview) {
        this.contentPreview = contentPreview;
    }

    public List<String> getMatchedTags() {
        return matchedTags;
    }

    public void setMatchedTags(List<String> matchedTags) {
        this.matchedTags = matchedTags;
    }

    public List<String> getAllTags() {
        return allTags;
    }

    public void setAllTags(List<String> allTags) {
        this.allTags = allTags;
    }

    public int getAttachmentCount() {
        return attachmentCount;
    }

    public void setAttachmentCount(int attachmentCount) {
        this.attachmentCount = attachmentCount;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }

    public double getRelevanceScore() {
        return relevanceScore;
    }

    public void setRelevanceScore(double relevanceScore) {
        this.relevanceScore = relevanceScore;
    }

    public long getViewCount() {
        return viewCount;
    }

    public void setViewCount(long viewCount) {
        this.viewCount = viewCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<HighlightMatch> getHighlights() {
        return highlights;
    }

    public void setHighlights(List<HighlightMatch> highlights) {
        this.highlights = highlights;
    }
}
