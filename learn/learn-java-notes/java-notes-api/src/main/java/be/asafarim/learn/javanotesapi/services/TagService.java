package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.entities.Tag;
import be.asafarim.learn.javanotesapi.repositories.TagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TagService {

    private final TagRepository repository;

    public TagService(TagRepository repository) {
        this.repository = repository;
    }

    /**
     * Get all tags ordered by name
     */
    public List<String> getAllTags() {
        return repository.findAllByOrderByNameAsc().stream()
                .map(Tag::getName)
                .toList();
    }

    /**
     * Get only tags that are used by at least one note
     */
    public List<String> getUsedTags() {
        return repository.findAllUsedTags().stream()
                .map(Tag::getName)
                .toList();
    }

    /**
     * Find or create tags by names.
     * Creates new tags if they don't exist.
     */
    @Transactional
    public Set<Tag> findOrCreateTags(List<String> tagNames) {
        if (tagNames == null || tagNames.isEmpty()) {
            return new HashSet<>();
        }

        // Normalize tag names
        List<String> normalizedNames = tagNames.stream()
                .map(name -> name.toLowerCase().trim())
                .filter(name -> !name.isEmpty())
                .distinct()
                .toList();

        if (normalizedNames.isEmpty()) {
            return new HashSet<>();
        }

        // Find existing tags
        List<Tag> existingTags = repository.findByNamesIgnoreCase(normalizedNames);
        Set<String> existingNames = existingTags.stream()
                .map(Tag::getName)
                .collect(Collectors.toSet());

        // Create new tags for names that don't exist
        Set<Tag> result = new HashSet<>(existingTags);
        for (String name : normalizedNames) {
            if (!existingNames.contains(name)) {
                Tag newTag = new Tag(name);
                repository.save(newTag);
                result.add(newTag);
            }
        }

        return result;
    }

    /**
     * Find a tag by name
     */
    public Tag findByName(String name) {
        return repository.findByNameIgnoreCase(name).orElse(null);
    }
}
