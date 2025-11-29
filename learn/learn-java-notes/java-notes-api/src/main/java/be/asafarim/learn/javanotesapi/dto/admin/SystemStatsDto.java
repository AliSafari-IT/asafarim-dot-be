package be.asafarim.learn.javanotesapi.dto.admin;

import java.util.List;
import java.util.Map;

public class SystemStatsDto {

    // User stats
    private long totalUsers;
    private long activeUsers;
    private long newUsersThisWeek;
    private long lockedUsers;
    private long disabledUsers;

    // Note stats
    private long totalNotes;
    private long publicNotes;
    private long privateNotes;
    private long featuredNotes;

    // Tag stats
    private long totalTags;
    private List<TagCount> topTags;

    // Activity stats
    private long failedLoginAttempts;
    private List<UserActivity> mostActiveUsers;

    // Storage stats
    private long totalAttachments;
    private long totalStorageBytes;

    // Charts data
    private List<TimeSeriesPoint> userGrowth;
    private List<TimeSeriesPoint> noteCreation;
    private Map<String, Long> visibilityDistribution;

    // Constructors
    public SystemStatsDto() {}

    // Getters and Setters
    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }

    public long getNewUsersThisWeek() { return newUsersThisWeek; }
    public void setNewUsersThisWeek(long newUsersThisWeek) { this.newUsersThisWeek = newUsersThisWeek; }

    public long getLockedUsers() { return lockedUsers; }
    public void setLockedUsers(long lockedUsers) { this.lockedUsers = lockedUsers; }

    public long getDisabledUsers() { return disabledUsers; }
    public void setDisabledUsers(long disabledUsers) { this.disabledUsers = disabledUsers; }

    public long getTotalNotes() { return totalNotes; }
    public void setTotalNotes(long totalNotes) { this.totalNotes = totalNotes; }

    public long getPublicNotes() { return publicNotes; }
    public void setPublicNotes(long publicNotes) { this.publicNotes = publicNotes; }

    public long getPrivateNotes() { return privateNotes; }
    public void setPrivateNotes(long privateNotes) { this.privateNotes = privateNotes; }

    public long getFeaturedNotes() { return featuredNotes; }
    public void setFeaturedNotes(long featuredNotes) { this.featuredNotes = featuredNotes; }

    public long getTotalTags() { return totalTags; }
    public void setTotalTags(long totalTags) { this.totalTags = totalTags; }

    public List<TagCount> getTopTags() { return topTags; }
    public void setTopTags(List<TagCount> topTags) { this.topTags = topTags; }

    public long getFailedLoginAttempts() { return failedLoginAttempts; }
    public void setFailedLoginAttempts(long failedLoginAttempts) { this.failedLoginAttempts = failedLoginAttempts; }

    public List<UserActivity> getMostActiveUsers() { return mostActiveUsers; }
    public void setMostActiveUsers(List<UserActivity> mostActiveUsers) { this.mostActiveUsers = mostActiveUsers; }

    public long getTotalAttachments() { return totalAttachments; }
    public void setTotalAttachments(long totalAttachments) { this.totalAttachments = totalAttachments; }

    public long getTotalStorageBytes() { return totalStorageBytes; }
    public void setTotalStorageBytes(long totalStorageBytes) { this.totalStorageBytes = totalStorageBytes; }

    public List<TimeSeriesPoint> getUserGrowth() { return userGrowth; }
    public void setUserGrowth(List<TimeSeriesPoint> userGrowth) { this.userGrowth = userGrowth; }

    public List<TimeSeriesPoint> getNoteCreation() { return noteCreation; }
    public void setNoteCreation(List<TimeSeriesPoint> noteCreation) { this.noteCreation = noteCreation; }

    public Map<String, Long> getVisibilityDistribution() { return visibilityDistribution; }
    public void setVisibilityDistribution(Map<String, Long> visibilityDistribution) { this.visibilityDistribution = visibilityDistribution; }

    // Inner classes for complex data
    public static class TagCount {
        private String name;
        private long count;

        public TagCount() {}
        public TagCount(String name, long count) {
            this.name = name;
            this.count = count;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public static class UserActivity {
        private String username;
        private String displayName;
        private long noteCount;
        private String lastLogin;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }

        public long getNoteCount() { return noteCount; }
        public void setNoteCount(long noteCount) { this.noteCount = noteCount; }

        public String getLastLogin() { return lastLogin; }
        public void setLastLogin(String lastLogin) { this.lastLogin = lastLogin; }
    }

    public static class TimeSeriesPoint {
        private String date;
        private long value;

        public TimeSeriesPoint() {}
        public TimeSeriesPoint(String date, long value) {
            this.date = date;
            this.value = value;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public long getValue() { return value; }
        public void setValue(long value) { this.value = value; }
    }
}
