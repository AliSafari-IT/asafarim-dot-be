package be.asafarim.learn.javanotesapi.dto;

import java.util.List;
import java.util.Map;

/**
 * DTO for the analytics dashboard containing user-level and global statistics.
 */
public class DashboardAnalytics {
    
    // User-level stats
    private long totalNotes;
    private long publicNotes;
    private long privateNotes;
    private long totalViews;
    private long totalPublicViews;
    private long totalPrivateViews;
    private long viewsLast7Days;
    private long viewsLast30Days;
    private long totalWords;
    private long totalReadingTimeMinutes;
    
    // Tag distribution
    private List<TagCount> tagDistribution;
    
    // Most viewed notes
    private List<NoteViewSummary> mostViewedNotes;
    
    // Views over time (last 30 days)
    private Map<String, Long> viewsPerDay;
    
    // Notes created over time (last 30 days)
    private Map<String, Long> notesCreatedPerDay;

    // Constructors
    public DashboardAnalytics() {}

    // Getters and Setters
    public long getTotalNotes() { return totalNotes; }
    public void setTotalNotes(long totalNotes) { this.totalNotes = totalNotes; }

    public long getPublicNotes() { return publicNotes; }
    public void setPublicNotes(long publicNotes) { this.publicNotes = publicNotes; }

    public long getPrivateNotes() { return privateNotes; }
    public void setPrivateNotes(long privateNotes) { this.privateNotes = privateNotes; }

    public long getTotalViews() { return totalViews; }
    public void setTotalViews(long totalViews) { this.totalViews = totalViews; }

    public long getTotalPublicViews() { return totalPublicViews; }
    public void setTotalPublicViews(long totalPublicViews) { this.totalPublicViews = totalPublicViews; }

    public long getTotalPrivateViews() { return totalPrivateViews; }
    public void setTotalPrivateViews(long totalPrivateViews) { this.totalPrivateViews = totalPrivateViews; }

    public long getViewsLast7Days() { return viewsLast7Days; }
    public void setViewsLast7Days(long viewsLast7Days) { this.viewsLast7Days = viewsLast7Days; }

    public long getViewsLast30Days() { return viewsLast30Days; }
    public void setViewsLast30Days(long viewsLast30Days) { this.viewsLast30Days = viewsLast30Days; }

    public long getTotalWords() { return totalWords; }
    public void setTotalWords(long totalWords) { this.totalWords = totalWords; }

    public long getTotalReadingTimeMinutes() { return totalReadingTimeMinutes; }
    public void setTotalReadingTimeMinutes(long totalReadingTimeMinutes) { this.totalReadingTimeMinutes = totalReadingTimeMinutes; }

    public List<TagCount> getTagDistribution() { return tagDistribution; }
    public void setTagDistribution(List<TagCount> tagDistribution) { this.tagDistribution = tagDistribution; }

    public List<NoteViewSummary> getMostViewedNotes() { return mostViewedNotes; }
    public void setMostViewedNotes(List<NoteViewSummary> mostViewedNotes) { this.mostViewedNotes = mostViewedNotes; }

    public Map<String, Long> getViewsPerDay() { return viewsPerDay; }
    public void setViewsPerDay(Map<String, Long> viewsPerDay) { this.viewsPerDay = viewsPerDay; }

    public Map<String, Long> getNotesCreatedPerDay() { return notesCreatedPerDay; }
    public void setNotesCreatedPerDay(Map<String, Long> notesCreatedPerDay) { this.notesCreatedPerDay = notesCreatedPerDay; }

    /**
     * Inner class for tag count distribution
     */
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

    /**
     * Inner class for note view summary (most viewed notes)
     */
    public static class NoteViewSummary {
        private String id;
        private String title;
        private long viewCount;
        private boolean isPublic;

        public NoteViewSummary() {}

        public NoteViewSummary(String id, String title, long viewCount, boolean isPublic) {
            this.id = id;
            this.title = title;
            this.viewCount = viewCount;
            this.isPublic = isPublic;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public long getViewCount() { return viewCount; }
        public void setViewCount(long viewCount) { this.viewCount = viewCount; }

        public boolean isPublic() { return isPublic; }
        public void setPublic(boolean isPublic) { this.isPublic = isPublic; }
    }
}
