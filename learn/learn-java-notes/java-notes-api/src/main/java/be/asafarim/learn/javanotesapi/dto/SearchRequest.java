package be.asafarim.learn.javanotesapi.dto;

import java.time.Instant;
import java.util.List;

/**
 * DTO for search requests with multi-field filtering
 */
public class SearchRequest {
    private String query;
    private List<String> tags;
    private Boolean hasAttachments;
    private Instant createdAfter;
    private Instant createdBefore;
    private Instant updatedAfter;
    private Instant updatedBefore;
    private String sort; // relevance, date, popularity, updated
    private Integer limit;
    private Integer offset;

    public SearchRequest() {
        this.limit = 30;
        this.offset = 0;
        this.sort = "relevance";
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public Boolean getHasAttachments() {
        return hasAttachments;
    }

    public void setHasAttachments(Boolean hasAttachments) {
        this.hasAttachments = hasAttachments;
    }

    public Instant getCreatedAfter() {
        return createdAfter;
    }

    public void setCreatedAfter(Instant createdAfter) {
        this.createdAfter = createdAfter;
    }

    public Instant getCreatedBefore() {
        return createdBefore;
    }

    public void setCreatedBefore(Instant createdBefore) {
        this.createdBefore = createdBefore;
    }

    public Instant getUpdatedAfter() {
        return updatedAfter;
    }

    public void setUpdatedAfter(Instant updatedAfter) {
        this.updatedAfter = updatedAfter;
    }

    public Instant getUpdatedBefore() {
        return updatedBefore;
    }

    public void setUpdatedBefore(Instant updatedBefore) {
        this.updatedBefore = updatedBefore;
    }

    public String getSort() {
        return sort;
    }

    public void setSort(String sort) {
        this.sort = sort;
    }

    public Integer getLimit() {
        return limit;
    }

    public void setLimit(Integer limit) {
        this.limit = limit != null ? Math.min(limit, 100) : 30;
    }

    public Integer getOffset() {
        return offset;
    }

    public void setOffset(Integer offset) {
        this.offset = offset != null ? offset : 0;
    }
}
