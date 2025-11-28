package be.asafarim.learn.javanotesapi.repositories;

import be.asafarim.learn.javanotesapi.entities.StudyNote;
import be.asafarim.learn.javanotesapi.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface StudyNoteRepository extends JpaRepository<StudyNote, UUID> {
    
    /**
     * Find all notes by user ordered by creation date (newest first)
     */
    List<StudyNote> findByUserOrderByCreatedAtDesc(User user);
    
    /**
     * Search notes by title or content for a specific user (case-insensitive)
     */
    @Query("SELECT n FROM StudyNote n WHERE n.user = :user AND (" +
           "LOWER(n.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(n.content) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<StudyNote> searchByTitleOrContentForUser(@Param("query") String query, @Param("user") User user);
    
    /**
     * Search notes ordered by creation date for a specific user (newest first)
     */
    @Query("SELECT n FROM StudyNote n WHERE n.user = :user AND (" +
           "LOWER(n.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(n.content) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY n.createdAt DESC")
    List<StudyNote> searchByTitleOrContentOrderByCreatedAtDescForUser(@Param("query") String query, @Param("user") User user);
    
    /**
     * Find notes by tag name for a specific user
     */
    @Query("SELECT DISTINCT n FROM StudyNote n JOIN n.tags t WHERE n.user = :user AND LOWER(t.name) = LOWER(:tagName) ORDER BY n.createdAt DESC")
    List<StudyNote> findByTagNameForUser(@Param("tagName") String tagName, @Param("user") User user);
    
    /**
     * Search notes by query and filter by tag for a specific user
     */
    @Query("SELECT DISTINCT n FROM StudyNote n JOIN n.tags t WHERE n.user = :user AND " +
           "LOWER(t.name) = LOWER(:tagName) AND " +
           "(LOWER(n.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(n.content) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY n.createdAt DESC")
    List<StudyNote> searchByQueryAndTagForUser(@Param("query") String query, @Param("tagName") String tagName, @Param("user") User user);
    
    /**
     * Count notes by user
     */
    long countByUser(User user);

    /**
     * Find all public notes ordered by creation date (newest first)
     */
    @Query("SELECT n FROM StudyNote n WHERE n.isPublic = true ORDER BY n.createdAt DESC")
    List<StudyNote> findAllPublicNotes();

    /**
     * Search public notes by title or content
     */
    @Query("SELECT n FROM StudyNote n WHERE n.isPublic = true AND (" +
           "LOWER(n.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(n.content) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY n.createdAt DESC")
    List<StudyNote> searchPublicByTitleOrContent(@Param("query") String query);

    /**
     * Find public notes by tag name
     */
    @Query("SELECT DISTINCT n FROM StudyNote n JOIN n.tags t " +
           "WHERE n.isPublic = true AND LOWER(t.name) = LOWER(:tagName) " +
           "ORDER BY n.createdAt DESC")
    List<StudyNote> findPublicByTagName(@Param("tagName") String tagName);

    /**
     * Search public notes with both query and tag
     */
    @Query("SELECT DISTINCT n FROM StudyNote n JOIN n.tags t " +
           "WHERE n.isPublic = true AND LOWER(t.name) = LOWER(:tagName) AND (" +
           "LOWER(n.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(n.content) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY n.createdAt DESC")
    List<StudyNote> searchPublicByQueryAndTag(@Param("query") String query, @Param("tagName") String tagName);

    /**
     * Count all public notes
     */
    @Query("SELECT COUNT(n) FROM StudyNote n WHERE n.isPublic = true")
    long countPublicNotes();

    // ============ Analytics Queries ============

    /**
     * Count public notes for a user
     */
    @Query("SELECT COUNT(n) FROM StudyNote n WHERE n.user = :user AND n.isPublic = true")
    long countPublicNotesByUser(@Param("user") User user);

    /**
     * Count private notes for a user
     */
    @Query("SELECT COUNT(n) FROM StudyNote n WHERE n.user = :user AND n.isPublic = false")
    long countPrivateNotesByUser(@Param("user") User user);

    /**
     * Sum of word counts for a user's notes
     */
    @Query("SELECT COALESCE(SUM(n.wordCount), 0) FROM StudyNote n WHERE n.user = :user")
    long sumWordCountByUser(@Param("user") User user);

    /**
     * Sum of reading time for a user's notes
     */
    @Query("SELECT COALESCE(SUM(n.readingTimeMinutes), 0) FROM StudyNote n WHERE n.user = :user")
    long sumReadingTimeByUser(@Param("user") User user);

    /**
     * Find notes created since a date for a user
     */
    @Query("SELECT n FROM StudyNote n WHERE n.user = :user AND n.createdAt >= :since ORDER BY n.createdAt ASC")
    List<StudyNote> findByUserAndCreatedAtAfter(@Param("user") User user, @Param("since") java.time.LocalDateTime since);

    // ============ Full-Text Search Queries ============

    /**
     * Full-text search for user's notes with relevance ranking
     */
    @Query(value = """
        SELECT n.*, ts_rank(n.search_vector, websearch_to_tsquery('english', :query)) as rank
        FROM study_notes n
        WHERE n.user_id = :userId
          AND n.search_vector @@ websearch_to_tsquery('english', :query)
        ORDER BY rank DESC
        """, nativeQuery = true)
    List<StudyNote> fullTextSearchForUser(@Param("query") String query, @Param("userId") UUID userId);

    /**
     * Full-text search for user's notes filtered by tag
     */
    @Query(value = """
        SELECT DISTINCT n.*, ts_rank(n.search_vector, websearch_to_tsquery('english', :query)) as rank
        FROM study_notes n
        JOIN study_note_tags snt ON n.id = snt.study_note_id
        JOIN tags t ON snt.tag_id = t.id
        WHERE n.user_id = :userId
          AND LOWER(t.name) = LOWER(:tagName)
          AND n.search_vector @@ websearch_to_tsquery('english', :query)
        ORDER BY rank DESC
        """, nativeQuery = true)
    List<StudyNote> fullTextSearchByTagForUser(@Param("query") String query, @Param("tagName") String tagName, @Param("userId") UUID userId);

    /**
     * Full-text search for public notes with relevance ranking
     */
    @Query(value = """
        SELECT n.*, ts_rank(n.search_vector, websearch_to_tsquery('english', :query)) as rank
        FROM study_notes n
        WHERE n.is_public = true
          AND n.search_vector @@ websearch_to_tsquery('english', :query)
        ORDER BY rank DESC
        """, nativeQuery = true)
    List<StudyNote> fullTextSearchPublic(@Param("query") String query);

    /**
     * Full-text search for public notes filtered by tag
     */
    @Query(value = """
        SELECT DISTINCT n.*, ts_rank(n.search_vector, websearch_to_tsquery('english', :query)) as rank
        FROM study_notes n
        JOIN study_note_tags snt ON n.id = snt.study_note_id
        JOIN tags t ON snt.tag_id = t.id
        WHERE n.is_public = true
          AND LOWER(t.name) = LOWER(:tagName)
          AND n.search_vector @@ websearch_to_tsquery('english', :query)
        ORDER BY rank DESC
        """, nativeQuery = true)
    List<StudyNote> fullTextSearchPublicByTag(@Param("query") String query, @Param("tagName") String tagName);

    /**
     * Get search headline (highlighted snippet) for a note
     */
    @Query(value = """
        SELECT ts_headline('english', :content, plainto_tsquery('english', :query),
            'StartSel=<mark>, StopSel=</mark>, MaxWords=50, MinWords=20, MaxFragments=2')
        """, nativeQuery = true)
    String getSearchHeadline(@Param("content") String content, @Param("query") String query);
}
