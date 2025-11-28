package be.asafarim.learn.javanotesapi.repositories;

import be.asafarim.learn.javanotesapi.entities.NoteView;
import be.asafarim.learn.javanotesapi.entities.StudyNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository for NoteView entity providing analytics queries.
 */
public interface NoteViewRepository extends JpaRepository<NoteView, UUID> {

    /**
     * Count total views for a specific note
     */
    long countByNote(StudyNote note);

    /**
     * Count total views for a note by note ID
     */
    @Query("SELECT COUNT(v) FROM NoteView v WHERE v.note.id = :noteId")
    long countByNoteId(@Param("noteId") UUID noteId);

    /**
     * Count public views for a specific note
     */
    @Query("SELECT COUNT(v) FROM NoteView v WHERE v.note.id = :noteId AND v.isPublicView = true")
    long countPublicViewsByNoteId(@Param("noteId") UUID noteId);

    /**
     * Count private (authenticated) views for a specific note
     */
    @Query("SELECT COUNT(v) FROM NoteView v WHERE v.note.id = :noteId AND v.isPublicView = false")
    long countPrivateViewsByNoteId(@Param("noteId") UUID noteId);

    /**
     * Count views in the last N days for a specific note
     */
    @Query("SELECT COUNT(v) FROM NoteView v WHERE v.note.id = :noteId AND v.viewedAt >= :since")
    long countViewsSince(@Param("noteId") UUID noteId, @Param("since") LocalDateTime since);

    /**
     * Count public views in the last N days
     */
    @Query("SELECT COUNT(v) FROM NoteView v WHERE v.note.id = :noteId AND v.isPublicView = true AND v.viewedAt >= :since")
    long countPublicViewsSince(@Param("noteId") UUID noteId, @Param("since") LocalDateTime since);

    /**
     * Count private views in the last N days
     */
    @Query("SELECT COUNT(v) FROM NoteView v WHERE v.note.id = :noteId AND v.isPublicView = false AND v.viewedAt >= :since")
    long countPrivateViewsSince(@Param("noteId") UUID noteId, @Param("since") LocalDateTime since);

    /**
     * Check if a specific user has already viewed a note today (for deduplication)
     */
    @Query("SELECT COUNT(v) > 0 FROM NoteView v WHERE v.note.id = :noteId AND v.user.id = :userId AND v.viewedAt >= :since")
    boolean hasUserViewedSince(@Param("noteId") UUID noteId, @Param("userId") UUID userId, @Param("since") LocalDateTime since);

    /**
     * Check if an IP has already viewed a note today (for anonymous deduplication)
     */
    @Query("SELECT COUNT(v) > 0 FROM NoteView v WHERE v.note.id = :noteId AND v.ipAddress = :ipAddress AND v.viewedAt >= :since")
    boolean hasIpViewedSince(@Param("noteId") UUID noteId, @Param("ipAddress") String ipAddress, @Param("since") LocalDateTime since);

    /**
     * Get unique viewer count for a note
     */
    @Query("SELECT COUNT(DISTINCT COALESCE(v.user.id, v.ipAddress)) FROM NoteView v WHERE v.note.id = :noteId")
    long countUniqueViewersByNoteId(@Param("noteId") UUID noteId);

    // ============ Dashboard Analytics Queries ============

    /**
     * Count total views for all notes owned by a user
     */
    @Query("SELECT COUNT(v) FROM NoteView v WHERE v.note.user.id = :userId")
    long countTotalViewsForUser(@Param("userId") UUID userId);

    /**
     * Count public views for all notes owned by a user
     */
    @Query("SELECT COUNT(v) FROM NoteView v WHERE v.note.user.id = :userId AND v.isPublicView = true")
    long countPublicViewsForUser(@Param("userId") UUID userId);

    /**
     * Count private views for all notes owned by a user
     */
    @Query("SELECT COUNT(v) FROM NoteView v WHERE v.note.user.id = :userId AND v.isPublicView = false")
    long countPrivateViewsForUser(@Param("userId") UUID userId);

    /**
     * Count views since a date for all notes owned by a user
     */
    @Query("SELECT COUNT(v) FROM NoteView v WHERE v.note.user.id = :userId AND v.viewedAt >= :since")
    long countViewsForUserSince(@Param("userId") UUID userId, @Param("since") LocalDateTime since);

    /**
     * Get most viewed notes for a user (returns note ID and view count)
     */
    @Query("SELECT v.note.id, COUNT(v) as viewCount FROM NoteView v " +
           "WHERE v.note.user.id = :userId " +
           "GROUP BY v.note.id " +
           "ORDER BY viewCount DESC")
    List<Object[]> findMostViewedNotesForUser(@Param("userId") UUID userId);

    /**
     * Get views per day for a user's notes (for chart)
     */
    @Query("SELECT CAST(v.viewedAt AS date), COUNT(v) FROM NoteView v " +
           "WHERE v.note.user.id = :userId AND v.viewedAt >= :since " +
           "GROUP BY CAST(v.viewedAt AS date) " +
           "ORDER BY CAST(v.viewedAt AS date) ASC")
    List<Object[]> getViewsPerDayForUser(@Param("userId") UUID userId, @Param("since") LocalDateTime since);
}
