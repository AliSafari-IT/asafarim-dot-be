package be.asafarim.learn.javanotesapi.dto;

import java.util.List;

/**
 * DTO for search analytics dashboard data
 */
public class SearchAnalyticsDto {
    private long totalSearches;
    private Double averageResultCount;
    private Double clickThroughRate;
    private List<QueryCount> topQueries;
    private List<QueryCount> zeroResultQueries;
    private List<DailyCount> searchTrend;
    private List<TagCount> popularTags;

    public SearchAnalyticsDto() {}

    // Nested DTOs
    public static class QueryCount {
        private String query;
        private long count;

        public QueryCount() {}

        public QueryCount(String query, long count) {
            this.query = query;
            this.count = count;
        }

        public String getQuery() { return query; }
        public void setQuery(String query) { this.query = query; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public static class DailyCount {
        private String date;
        private long count;

        public DailyCount() {}

        public DailyCount(String date, long count) {
            this.date = date;
            this.count = count;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public static class TagCount {
        private String tag;
        private long count;

        public TagCount() {}

        public TagCount(String tag, long count) {
            this.tag = tag;
            this.count = count;
        }

        public String getTag() { return tag; }
        public void setTag(String tag) { this.tag = tag; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    // Getters and setters
    public long getTotalSearches() {
        return totalSearches;
    }

    public void setTotalSearches(long totalSearches) {
        this.totalSearches = totalSearches;
    }

    public Double getAverageResultCount() {
        return averageResultCount;
    }

    public void setAverageResultCount(Double averageResultCount) {
        this.averageResultCount = averageResultCount;
    }

    public Double getClickThroughRate() {
        return clickThroughRate;
    }

    public void setClickThroughRate(Double clickThroughRate) {
        this.clickThroughRate = clickThroughRate;
    }

    public List<QueryCount> getTopQueries() {
        return topQueries;
    }

    public void setTopQueries(List<QueryCount> topQueries) {
        this.topQueries = topQueries;
    }

    public List<QueryCount> getZeroResultQueries() {
        return zeroResultQueries;
    }

    public void setZeroResultQueries(List<QueryCount> zeroResultQueries) {
        this.zeroResultQueries = zeroResultQueries;
    }

    public List<DailyCount> getSearchTrend() {
        return searchTrend;
    }

    public void setSearchTrend(List<DailyCount> searchTrend) {
        this.searchTrend = searchTrend;
    }

    public List<TagCount> getPopularTags() {
        return popularTags;
    }

    public void setPopularTags(List<TagCount> popularTags) {
        this.popularTags = popularTags;
    }
}
