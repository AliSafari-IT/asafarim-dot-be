package be.asafarim.learn.javanotesapi.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_preferences")
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "notes_per_page")
    private int notesPerPage = 10;

    @Column(length = 20)
    private String theme = "SYSTEM"; // LIGHT, DARK, SYSTEM

    @Column(length = 10)
    private String language = "en";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public UserPreference() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public UserPreference(User user) {
        this();
        this.user = user;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public int getNotesPerPage() { return notesPerPage; }
    public void setNotesPerPage(int notesPerPage) { 
        // Validate: only allow 10, 20, or 50
        if (notesPerPage == 10 || notesPerPage == 20 || notesPerPage == 50) {
            this.notesPerPage = notesPerPage;
        } else {
            this.notesPerPage = 10; // default
        }
    }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { 
        if (theme != null && (theme.equals("LIGHT") || theme.equals("DARK") || theme.equals("SYSTEM"))) {
            this.theme = theme;
        } else {
            this.theme = "SYSTEM";
        }
    }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language != null ? language : "en"; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
