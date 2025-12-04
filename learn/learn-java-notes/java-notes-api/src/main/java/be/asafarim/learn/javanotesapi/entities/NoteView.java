package be.asafarim.learn.javanotesapi.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity to track note views for analytics.
 * Stores view events for both public (anonymous) and private (authenticated) note access.
 */
@Entity
@Table(name = "note_views", indexes = {
    @Index(name = "idx_note_views_note_id", columnList = "note_id"),
    @Index(name = "idx_note_views_user_id", columnList = "user_id"),
    @Index(name = "idx_note_views_viewed_at", columnList = "viewedAt"),
    @Index(name = "idx_note_views_is_public", columnList = "isPublicView")
})
public class NoteView {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id", nullable = false)
    private StudyNote note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @Column(nullable = false)
    private LocalDateTime viewedAt;

    @Column(nullable = false)
    private boolean isPublicView;

    @Column(length = 500)
    private String userAgent;

    @Column(length = 45)
    private String ipAddress;

    @PrePersist
    protected void onCreate() {
        if (viewedAt == null) {
            viewedAt = LocalDateTime.now();
        }
    }

    // Constructors
    public NoteView() {}

    public NoteView(StudyNote note, User user, boolean isPublicView) {
        this.note = note;
        this.user = user;
        this.isPublicView = isPublicView;
        this.viewedAt = LocalDateTime.now();
    }

    public NoteView(StudyNote note, User user, boolean isPublicView, String userAgent, String ipAddress) {
        this.note = note;
        this.user = user;
        this.isPublicView = isPublicView;
        this.userAgent = userAgent;
        this.ipAddress = ipAddress;
        this.viewedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public StudyNote getNote() { return note; }
    public void setNote(StudyNote note) { this.note = note; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getViewedAt() { return viewedAt; }
    public void setViewedAt(LocalDateTime viewedAt) { this.viewedAt = viewedAt; }

    public boolean isPublicView() { return isPublicView; }
    public void setPublicView(boolean publicView) { isPublicView = publicView; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
}
