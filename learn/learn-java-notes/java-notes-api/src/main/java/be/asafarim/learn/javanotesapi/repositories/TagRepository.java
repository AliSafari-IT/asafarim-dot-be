package be.asafarim.learn.javanotesapi.repositories;

import be.asafarim.learn.javanotesapi.dto.TagUsageProjection;
import be.asafarim.learn.javanotesapi.entities.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TagRepository extends JpaRepository<Tag, UUID> {

    /**
     * Find a tag by its name (case-insensitive)
     */
    Optional<Tag> findByNameIgnoreCase(String name);

    /**
     * Check if a tag exists by name
     */
    boolean existsByNameIgnoreCase(String name);

    /**
     * Find all tags ordered by name
     */
    List<Tag> findAllByOrderByNameAsc();

    /**
     * Find tags that are used by at least one note
     */
    @Query("SELECT DISTINCT t FROM Tag t JOIN t.notes n ORDER BY t.name ASC")
    List<Tag> findAllUsedTags();

    /**
     * Find tags by names (for bulk lookup)
     */
    @Query("SELECT t FROM Tag t WHERE LOWER(t.name) IN :names")
    List<Tag> findByNamesIgnoreCase(List<String> names);

    /**
     * Get tag usage statistics
     */
    @Query("SELECT t.id as id, t.name as name, COUNT(n.id) as usageCount " +
           "FROM Tag t LEFT JOIN t.notes n " +
           "GROUP BY t.id, t.name " +
           "ORDER BY COUNT(n.id) DESC, t.name ASC")
    List<TagUsageProjection> findTagUsageStats();
}
