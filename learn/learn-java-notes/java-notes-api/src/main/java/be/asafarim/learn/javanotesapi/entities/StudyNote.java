package be.asafarim.learn.javanotesapi.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "study_notes")
public class StudyNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.EAGER)
    @JoinTable(
        name = "study_note_tags",
        joinColumns = @JoinColumn(name = "study_note_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public StudyNote() {}

    public StudyNote(String title, String content) {
        this.title = title;
        this.content = content;
    }

    // getters and setters
    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }

    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public Set<Tag> getTags() { return tags; }

    public void setTags(Set<Tag> tags) { this.tags = tags; }

    public void addTag(Tag tag) {
        this.tags.add(tag);
        tag.getNotes().add(this);
    }

    public void removeTag(Tag tag) {
        this.tags.remove(tag);
        tag.getNotes().remove(this);
    }

    public void clearTags() {
        for (Tag tag : new HashSet<>(this.tags)) {
            removeTag(tag);
        }
    }
}
