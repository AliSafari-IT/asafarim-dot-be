package be.asafarim.learn.javanotesapi.entities;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Entity for tracking search analytics
 */
@Entity
@Table(name = "search_analytics", indexes = {
    @Index(name = "idx_search_query", columnList = "query"),
    @Index(name = "idx_search_timestamp", columnList = "timestamp"),
    @Index(name = "idx_search_user", columnList = "user_id")
})
public class SearchAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String query;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "result_count")
    private int resultCount;

    @Column(name = "clicked_note_id")
    private UUID clickedNoteId;

    @Column(name = "click_position")
    private Integer clickPosition;

    @Column(name = "search_duration_ms")
    private long searchDurationMs;

    @Column
    private Instant timestamp;

    @Column(name = "is_public_search")
    private boolean isPublicSearch;

    @Column(name = "tags_used")
    private String tagsUsed; // Comma-separated list

    @Column(name = "has_attachment_filter")
    private Boolean hasAttachmentFilter;

    @Column(name = "sort_option")
    private String sortOption;

    public SearchAnalytics() {
        this.timestamp = Instant.now();
    }

    public SearchAnalytics(String query, UUID userId, boolean isPublicSearch) {
        this.query = query;
        this.userId = userId;
        this.isPublicSearch = isPublicSearch;
        this.timestamp = Instant.now();
    }

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public int getResultCount() {
        return resultCount;
    }

    public void setResultCount(int resultCount) {
        this.resultCount = resultCount;
    }

    public UUID getClickedNoteId() {
        return clickedNoteId;
    }

    public void setClickedNoteId(UUID clickedNoteId) {
        this.clickedNoteId = clickedNoteId;
    }

    public Integer getClickPosition() {
        return clickPosition;
    }

    public void setClickPosition(Integer clickPosition) {
        this.clickPosition = clickPosition;
    }

    public long getSearchDurationMs() {
        return searchDurationMs;
    }

    public void setSearchDurationMs(long searchDurationMs) {
        this.searchDurationMs = searchDurationMs;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isPublicSearch() {
        return isPublicSearch;
    }

    public void setPublicSearch(boolean publicSearch) {
        isPublicSearch = publicSearch;
    }

    public String getTagsUsed() {
        return tagsUsed;
    }

    public void setTagsUsed(String tagsUsed) {
        this.tagsUsed = tagsUsed;
    }

    public Boolean getHasAttachmentFilter() {
        return hasAttachmentFilter;
    }

    public void setHasAttachmentFilter(Boolean hasAttachmentFilter) {
        this.hasAttachmentFilter = hasAttachmentFilter;
    }

    public String getSortOption() {
        return sortOption;
    }

    public void setSortOption(String sortOption) {
        this.sortOption = sortOption;
    }
}
