package be.asafarim.learn.javanotesapi.dto;

import java.util.List;

/**
 * DTO for search response containing hits and metadata
 */
public class SearchResult {
    private List<SearchHit> hits;
    private long totalCount;
    private int limit;
    private int offset;
    private String query;
    private long searchTimeMs;
    private List<String> suggestions;
    private List<TagSuggestion> relatedTags;

    public SearchResult() {}

    public SearchResult(List<SearchHit> hits, long totalCount, int limit, int offset) {
        this.hits = hits;
        this.totalCount = totalCount;
        this.limit = limit;
        this.offset = offset;
    }

    // Nested class for tag suggestions
    public static class TagSuggestion {
        private String name;
        private long count;

        public TagSuggestion() {}

        public TagSuggestion(String name, long count) {
            this.name = name;
            this.count = count;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    // Getters and setters
    public List<SearchHit> getHits() {
        return hits;
    }

    public void setHits(List<SearchHit> hits) {
        this.hits = hits;
    }

    public long getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    public int getOffset() {
        return offset;
    }

    public void setOffset(int offset) {
        this.offset = offset;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public long getSearchTimeMs() {
        return searchTimeMs;
    }

    public void setSearchTimeMs(long searchTimeMs) {
        this.searchTimeMs = searchTimeMs;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }

    public List<TagSuggestion> getRelatedTags() {
        return relatedTags;
    }

    public void setRelatedTags(List<TagSuggestion> relatedTags) {
        this.relatedTags = relatedTags;
    }
}
