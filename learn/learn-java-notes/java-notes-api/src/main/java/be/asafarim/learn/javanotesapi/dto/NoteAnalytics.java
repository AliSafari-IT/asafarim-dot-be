package be.asafarim.learn.javanotesapi.dto;

/**
 * DTO for note analytics data.
 * Contains view statistics for a specific note.
 */
public class NoteAnalytics {
    private long totalViews;
    private long publicViews;
    private long privateViews;
    private long viewsLast7Days;
    private long viewsLast30Days;
    private long uniqueViewers;

    public NoteAnalytics() {}

    public NoteAnalytics(long totalViews, long publicViews, long privateViews,
                         long viewsLast7Days, long viewsLast30Days, long uniqueViewers) {
        this.totalViews = totalViews;
        this.publicViews = publicViews;
        this.privateViews = privateViews;
        this.viewsLast7Days = viewsLast7Days;
        this.viewsLast30Days = viewsLast30Days;
        this.uniqueViewers = uniqueViewers;
    }

    // Getters and Setters
    public long getTotalViews() { return totalViews; }
    public void setTotalViews(long totalViews) { this.totalViews = totalViews; }

    public long getPublicViews() { return publicViews; }
    public void setPublicViews(long publicViews) { this.publicViews = publicViews; }

    public long getPrivateViews() { return privateViews; }
    public void setPrivateViews(long privateViews) { this.privateViews = privateViews; }

    public long getViewsLast7Days() { return viewsLast7Days; }
    public void setViewsLast7Days(long viewsLast7Days) { this.viewsLast7Days = viewsLast7Days; }

    public long getViewsLast30Days() { return viewsLast30Days; }
    public void setViewsLast30Days(long viewsLast30Days) { this.viewsLast30Days = viewsLast30Days; }

    public long getUniqueViewers() { return uniqueViewers; }
    public void setUniqueViewers(long uniqueViewers) { this.uniqueViewers = uniqueViewers; }
}
