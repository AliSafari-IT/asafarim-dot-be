package be.asafarim.learn.javanotesapi.repositories;

import be.asafarim.learn.javanotesapi.entities.StudyNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudyNoteRepository extends JpaRepository<StudyNote, Long> {
    
    /**
     * Search notes by title or content (case-insensitive)
     */
    @Query("SELECT n FROM StudyNote n WHERE " +
           "LOWER(n.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(n.content) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<StudyNote> searchByTitleOrContent(@Param("query") String query);
    
    /**
     * Find all notes ordered by creation date (newest first)
     */
    List<StudyNote> findAllByOrderByCreatedAtDesc();
    
    /**
     * Search notes ordered by creation date (newest first)
     */
    @Query("SELECT n FROM StudyNote n WHERE " +
           "LOWER(n.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(n.content) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY n.createdAt DESC")
    List<StudyNote> searchByTitleOrContentOrderByCreatedAtDesc(@Param("query") String query);
}
