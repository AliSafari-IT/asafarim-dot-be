package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.*;
import be.asafarim.learn.javanotesapi.entities.StudyNote;
import be.asafarim.learn.javanotesapi.entities.Tag;
import be.asafarim.learn.javanotesapi.repositories.StudyNoteRepository;
import be.asafarim.learn.javanotesapi.repositories.TagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class TagManagementService {

    private final TagRepository tagRepository;
    private final StudyNoteRepository noteRepository;

    public TagManagementService(TagRepository tagRepository, StudyNoteRepository noteRepository) {
        this.tagRepository = tagRepository;
        this.noteRepository = noteRepository;
    }

    /**
     * Get all tags with usage counts
     */
    @Transactional(readOnly = true)
    public List<TagUsageDto> getAllTagUsage() {
        List<TagUsageProjection> projections = tagRepository.findTagUsageStats();
        return projections.stream()
                .map(p -> new TagUsageDto(p.getId(), p.getName(), p.getUsageCount(), Instant.now()))
                .collect(Collectors.toList());
    }

    /**
     * Rename a tag
     */
    public TagUsageDto renameTag(TagRenameRequest request) {
        if (request.getTagId() == null) {
            throw new RuntimeException("Tag ID cannot be null");
        }
        
        Tag tag = tagRepository.findById(request.getTagId())
                .orElseThrow(() -> new RuntimeException("Tag not found"));

        String normalizedName = request.getNewName().toLowerCase().trim();
        
        if (normalizedName.isEmpty()) {
            throw new RuntimeException("Tag name cannot be empty");
        }

        // Check if another tag with this name already exists
        Optional<Tag> existing = tagRepository.findByNameIgnoreCase(normalizedName);
        if (existing.isPresent() && !existing.get().getId().equals(tag.getId())) {
            throw new RuntimeException("A tag with this name already exists");
        }

        tag.setName(normalizedName);
        tagRepository.save(tag);

        long usageCount = tag.getNotes().size();
        return new TagUsageDto(tag.getId(), tag.getName(), usageCount, Instant.now());
    }

    /**
     * Merge multiple tags into one
     */
    public TagUsageDto mergeTags(TagMergeRequest request) {
        if (request.getSourceTagIds() == null || request.getSourceTagIds().size() < 2) {
            throw new RuntimeException("At least 2 tags must be selected for merging");
        }

        String normalizedTargetName = request.getTargetName().toLowerCase().trim();
        if (normalizedTargetName.isEmpty()) {
            throw new RuntimeException("Target tag name cannot be empty");
        }

        // Find or create target tag
        Tag targetTag = tagRepository.findByNameIgnoreCase(normalizedTargetName)
                .orElseGet(() -> {
                    Tag newTag = new Tag(normalizedTargetName);
                    return tagRepository.save(newTag);
                });

        // Get source tags
        List<Tag> sourceTags = tagRepository.findAllById(request.getSourceTagIds());
        if (sourceTags.isEmpty()) {
            throw new RuntimeException("No source tags found");
        }

        // Remove target tag from source list if it's there
        sourceTags = sourceTags.stream()
                .filter(t -> !t.getId().equals(targetTag.getId()))
                .collect(Collectors.toList());

        // Move all notes from source tags to target tag
        for (Tag sourceTag : sourceTags) {
            Set<StudyNote> notes = new HashSet<>(sourceTag.getNotes());
            for (StudyNote note : notes) {
                note.getTags().remove(sourceTag);
                note.getTags().add(targetTag);
                noteRepository.save(note);
            }
            // Delete source tag
            tagRepository.delete(sourceTag);
        }

        // Refresh target tag to get updated note count
        Tag finalTargetTag = tagRepository.findById(targetTag.getId())
                .orElseThrow(() -> new RuntimeException("Target tag not found after merge"));

        long usageCount = finalTargetTag.getNotes().size();
        return new TagUsageDto(finalTargetTag.getId(), finalTargetTag.getName(), usageCount, Instant.now());
    }

    /**
     * Delete a tag
     */
    public void deleteTag(TagDeleteRequest request) {
        if (request.getTagId() == null) {
            throw new RuntimeException("Tag ID cannot be null");
        }
        
        Tag tag = tagRepository.findById(request.getTagId())
                .orElseThrow(() -> new RuntimeException("Tag not found"));

        long usageCount = tag.getNotes().size();

        if (usageCount > 0 && !request.isForce()) {
            throw new RuntimeException("Cannot delete tag with " + usageCount + " notes. Use force=true to delete anyway.");
        }

        if (request.isForce()) {
            // Remove tag from all notes
            Set<StudyNote> notes = new HashSet<>(tag.getNotes());
            for (StudyNote note : notes) {
                note.getTags().remove(tag);
                noteRepository.save(note);
            }
        }

        tagRepository.delete(tag);
    }
}
