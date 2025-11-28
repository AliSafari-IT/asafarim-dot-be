package be.asafarim.learn.javanotesapi.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO for full-text search results with relevance ranking and highlights
 */
public record SearchResultDto(
    UUID id,
    String title,
    String content,
    String highlightedTitle,
    String highlightedContent,
    List<String> tags,
    boolean isPublic,
    int readingTimeMinutes,
    int wordCount,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    double relevanceScore,
    NoteAnalytics analytics
) {
    public static SearchResultDto from(
        UUID id,
        String title,
        String content,
        String highlightedTitle,
        String highlightedContent,
        List<String> tags,
        boolean isPublic,
        int readingTimeMinutes,
        int wordCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        double relevanceScore,
        NoteAnalytics analytics
    ) {
        return new SearchResultDto(
            id, title, content,
            highlightedTitle, highlightedContent,
            tags, isPublic, readingTimeMinutes, wordCount,
            createdAt, updatedAt, relevanceScore, analytics
        );
    }
}
