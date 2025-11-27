package be.asafarim.learn.javanotesapi.repositories;

import be.asafarim.learn.javanotesapi.entities.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {
    
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
}
