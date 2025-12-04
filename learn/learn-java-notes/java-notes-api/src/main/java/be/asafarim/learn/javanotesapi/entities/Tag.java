package be.asafarim.learn.javanotesapi.entities;

import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(name = "tags")
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String name;

    @ManyToMany(mappedBy = "tags")
    private Set<StudyNote> notes = new HashSet<>();

    public Tag() {}

    public Tag(String name) {
        this.name = name.toLowerCase().trim();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name.toLowerCase().trim(); }

    public Set<StudyNote> getNotes() { return notes; }
    public void setNotes(Set<StudyNote> notes) { this.notes = notes; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Tag tag = (Tag) o;
        return name != null && name.equals(tag.name);
    }

    @Override
    public int hashCode() {
        return name != null ? name.hashCode() : 0;
    }
}
