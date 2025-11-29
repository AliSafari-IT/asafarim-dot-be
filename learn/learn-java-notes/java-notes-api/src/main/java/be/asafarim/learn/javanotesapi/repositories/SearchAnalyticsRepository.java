package be.asafarim.learn.javanotesapi.repositories;

import be.asafarim.learn.javanotesapi.entities.SearchAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface SearchAnalyticsRepository extends JpaRepository<SearchAnalytics, UUID> {

    /**
     * Get top searched queries with counts
     */
    @Query(value = "SELECT query, COUNT(*) as count FROM search_analytics " +
            "WHERE timestamp > :since GROUP BY query ORDER BY count DESC LIMIT :limit",
            nativeQuery = true)
    List<Object[]> findTopQueries(@Param("since") Instant since, @Param("limit") int limit);

    /**
     * Get queries with zero results
     */
    @Query("SELECT sa.query, COUNT(sa) FROM SearchAnalytics sa " +
            "WHERE sa.resultCount = 0 AND sa.timestamp > :since " +
            "GROUP BY sa.query ORDER BY COUNT(sa) DESC")
    List<Object[]> findZeroResultQueries(@Param("since") Instant since);

    /**
     * Get most clicked notes from search results
     */
    @Query(value = "SELECT clicked_note_id, COUNT(*) as clicks FROM search_analytics " +
            "WHERE clicked_note_id IS NOT NULL AND timestamp > :since " +
            "GROUP BY clicked_note_id ORDER BY clicks DESC LIMIT :limit",
            nativeQuery = true)
    List<Object[]> findMostClickedNotes(@Param("since") Instant since, @Param("limit") int limit);

    /**
     * Get search frequency over time (daily aggregation)
     */
    @Query(value = "SELECT CAST(timestamp AS DATE) as day, COUNT(*) as count " +
            "FROM search_analytics WHERE timestamp > :since " +
            "GROUP BY CAST(timestamp AS DATE) ORDER BY day",
            nativeQuery = true)
    List<Object[]> findSearchFrequencyByDay(@Param("since") Instant since);

    /**
     * Get popular tags used in searches
     */
    @Query(value = "SELECT tags_used, COUNT(*) as count FROM search_analytics " +
            "WHERE tags_used IS NOT NULL AND tags_used != '' AND timestamp > :since " +
            "GROUP BY tags_used ORDER BY count DESC LIMIT :limit",
            nativeQuery = true)
    List<Object[]> findPopularSearchTags(@Param("since") Instant since, @Param("limit") int limit);

    /**
     * Count total searches in period
     */
    @Query("SELECT COUNT(sa) FROM SearchAnalytics sa WHERE sa.timestamp > :since")
    long countSearchesSince(@Param("since") Instant since);

    /**
     * Get average result count
     */
    @Query("SELECT AVG(sa.resultCount) FROM SearchAnalytics sa WHERE sa.timestamp > :since")
    Double getAverageResultCount(@Param("since") Instant since);

    /**
     * Get click-through rate (searches with clicks / total searches)
     */
    @Query("SELECT " +
            "COUNT(CASE WHEN sa.clickedNoteId IS NOT NULL THEN 1 END) * 100.0 / COUNT(sa) " +
            "FROM SearchAnalytics sa WHERE sa.timestamp > :since")
    Double getClickThroughRate(@Param("since") Instant since);

    /**
     * Get recent searches by user
     */
    List<SearchAnalytics> findByUserIdOrderByTimestampDesc(UUID userId);
}
