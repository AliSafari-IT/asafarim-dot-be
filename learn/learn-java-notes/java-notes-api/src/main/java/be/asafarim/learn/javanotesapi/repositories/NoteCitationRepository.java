package be.asafarim.learn.javanotesapi.repositories;

import be.asafarim.learn.javanotesapi.entities.NoteCitation;
import be.asafarim.learn.javanotesapi.entities.StudyNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for NoteCitation entities - manages note-to-note citation relationships.
 */
@Repository
public interface NoteCitationRepository extends JpaRepository<NoteCitation, UUID> {

    // ==================== Find by Note ====================

    /**
     * Find all outgoing citations from a note (notes this note cites)
     */
    List<NoteCitation> findByNoteIdOrderByCitationOrderAsc(UUID noteId);

    /**
     * Find all incoming citations to a note (notes that cite this note)
     */
    List<NoteCitation> findByReferencedNoteIdOrderByCreatedAtDesc(UUID referencedNoteId);

    /**
     * Find a specific citation relationship
     */
    Optional<NoteCitation> findByNoteIdAndReferencedNoteId(UUID noteId, UUID referencedNoteId);

    /**
     * Check if a citation relationship exists
     */
    boolean existsByNoteIdAndReferencedNoteId(UUID noteId, UUID referencedNoteId);

    // ==================== Counts ====================

    /**
     * Count outgoing citations from a note
     */
    long countByNoteId(UUID noteId);

    /**
     * Count incoming citations to a note (how many times this note is cited)
     */
    long countByReferencedNoteId(UUID referencedNoteId);

    // ==================== Citation Order Management ====================

    /**
     * Get the maximum citation order for a note
     */
    @Query("SELECT COALESCE(MAX(nc.citationOrder), 0) FROM NoteCitation nc WHERE nc.note.id = :noteId")
    Integer getMaxCitationOrder(@Param("noteId") UUID noteId);

    /**
     * Update citation orders when reordering
     */
    @Modifying
    @Query("UPDATE NoteCitation nc SET nc.citationOrder = :newOrder WHERE nc.id = :citationId")
    void updateCitationOrder(@Param("citationId") UUID citationId, @Param("newOrder") Integer newOrder);

    // ==================== Bulk Operations ====================

    /**
     * Delete all outgoing citations from a note
     */
    @Modifying
    void deleteByNoteId(UUID noteId);

    /**
     * Delete all incoming citations to a note (when note is deleted)
     */
    @Modifying
    void deleteByReferencedNoteId(UUID referencedNoteId);

    // ==================== Advanced Queries ====================

    /**
     * Find notes that cite a specific note (returns the citing notes)
     */
    @Query("SELECT nc.note FROM NoteCitation nc WHERE nc.referencedNote.id = :noteId ORDER BY nc.createdAt DESC")
    List<StudyNote> findCitingNotes(@Param("noteId") UUID noteId);

    /**
     * Find notes cited by a specific note (returns the referenced notes)
     */
    @Query("SELECT nc.referencedNote FROM NoteCitation nc WHERE nc.note.id = :noteId ORDER BY nc.citationOrder ASC")
    List<StudyNote> findCitedNotes(@Param("noteId") UUID noteId);

    /**
     * Find all citations by a user (across all their notes)
     */
    @Query("SELECT nc FROM NoteCitation nc WHERE nc.note.user.id = :userId ORDER BY nc.createdAt DESC")
    List<NoteCitation> findByUserId(@Param("userId") UUID userId);

    /**
     * Find citations by inline marker pattern
     */
    @Query("SELECT nc FROM NoteCitation nc WHERE nc.note.id = :noteId AND nc.inlineMarker LIKE :pattern")
    List<NoteCitation> findByNoteIdAndMarkerPattern(@Param("noteId") UUID noteId, @Param("pattern") String pattern);

    /**
     * Check if note has any incoming citations (is cited by others)
     */
    @Query("SELECT COUNT(nc) > 0 FROM NoteCitation nc WHERE nc.referencedNote.id = :noteId")
    boolean isCitedByOthers(@Param("noteId") UUID noteId);

    /**
     * Find notes most frequently cited by a user
     */
    @Query("SELECT nc.referencedNote, COUNT(nc) as citationCount FROM NoteCitation nc " +
           "WHERE nc.note.user.id = :userId " +
           "GROUP BY nc.referencedNote " +
           "ORDER BY citationCount DESC")
    List<Object[]> findMostCitedNotesByUser(@Param("userId") UUID userId);
}
