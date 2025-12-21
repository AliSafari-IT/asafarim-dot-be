package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.*;
import be.asafarim.learn.javanotesapi.entities.StudyNote;
import be.asafarim.learn.javanotesapi.entities.Tag;
import be.asafarim.learn.javanotesapi.entities.User;
import be.asafarim.learn.javanotesapi.entities.SearchAnalytics;
import be.asafarim.learn.javanotesapi.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SearchService {
    private final StudyNoteRepository noteRepository;
    private final NoteViewService noteViewService;
    private final AttachmentRepository attachmentRepository;
    private final TagRepository tagRepository;
    private final SearchAnalyticsRepository analyticsRepository;
    private final NoteViewRepository noteViewRepository;

    public SearchService(
            StudyNoteRepository noteRepository,
            NoteViewService noteViewService,
            AttachmentRepository attachmentRepository,
            TagRepository tagRepository,
            SearchAnalyticsRepository analyticsRepository,
            NoteViewRepository noteViewRepository) {
        this.noteRepository = noteRepository;
        this.noteViewService = noteViewService;
        this.attachmentRepository = attachmentRepository;
        this.tagRepository = tagRepository;
        this.analyticsRepository = analyticsRepository;
        this.noteViewRepository = noteViewRepository;
    }

    /**
     * Advanced search for authenticated users - sees own notes + public notes
     */
    @Transactional
    public SearchResult advancedSearch(SearchRequest request, User user) {
        long startTime = System.currentTimeMillis();
        
        // Get user's notes + public notes
        List<StudyNote> allNotes = new ArrayList<>();
        allNotes.addAll(noteRepository.findByUserOrderByCreatedAtDesc(user));
        
        // Add public notes not owned by user
        List<StudyNote> publicNotes = noteRepository.findAllPublicNotes();
        for (StudyNote note : publicNotes) {
            if (!note.getUser().getId().equals(user.getId())) {
                allNotes.add(note);
            }
        }
        
        // Apply filters and rank
        List<SearchHit> hits = filterAndRank(allNotes, request);
        long totalCount = hits.size();
        
        // Apply pagination
        int offset = request.getOffset() != null ? request.getOffset() : 0;
        int limit = request.getLimit() != null ? request.getLimit() : 30;
        List<SearchHit> pagedHits = hits.stream()
                .skip(offset)
                .limit(limit)
                .collect(Collectors.toList());
        
        // Build result
        SearchResult result = new SearchResult(pagedHits, totalCount, limit, offset);
        result.setQuery(request.getQuery());
        result.setSearchTimeMs(System.currentTimeMillis() - startTime);
        result.setRelatedTags(getRelatedTags(request.getQuery(), pagedHits));
        result.setSuggestions(getSuggestions(request.getQuery(), hits.isEmpty()));
        
        // Track analytics
        trackSearch(request, user.getId(), (int) totalCount, false);
        
        return result;
    }

    /**
     * Public search - only sees public notes
     */
    @Transactional
    public SearchResult publicSearch(SearchRequest request) {
        long startTime = System.currentTimeMillis();
        
        List<StudyNote> publicNotes = noteRepository.findAllPublicNotes();
        List<SearchHit> hits = filterAndRank(publicNotes, request);
        long totalCount = hits.size();
        
        // Apply pagination
        int offset = request.getOffset() != null ? request.getOffset() : 0;
        int limit = request.getLimit() != null ? request.getLimit() : 30;
        List<SearchHit> pagedHits = hits.stream()
                .skip(offset)
                .limit(limit)
                .collect(Collectors.toList());
        
        SearchResult result = new SearchResult(pagedHits, totalCount, limit, offset);
        result.setQuery(request.getQuery());
        result.setSearchTimeMs(System.currentTimeMillis() - startTime);
        result.setRelatedTags(getRelatedTags(request.getQuery(), pagedHits));
        result.setSuggestions(getSuggestions(request.getQuery(), hits.isEmpty()));
        
        // Track analytics (null user for public)
        trackSearch(request, null, (int) totalCount, true);
        
        return result;
    }

    /**
     * Filter and rank notes based on search criteria
     */
    private List<SearchHit> filterAndRank(List<StudyNote> notes, SearchRequest request) {
        String query = request.getQuery() != null ? request.getQuery().toLowerCase().trim() : "";
        List<String> queryTags = request.getTags() != null ? request.getTags() : Collections.emptyList();
        
        return notes.stream()
                .filter(note -> matchesFilters(note, request))
                .filter(note -> matchesQuery(note, query)) // Must match query in title or content
                .map(note -> createSearchHit(note, query, queryTags))
                .filter(hit -> hit.getRelevanceScore() > 0 || query.isEmpty())
                .sorted(getComparator(request.getSort()))
                .collect(Collectors.toList());
    }
    
    /**
     * Check if note matches the search query in title or content
     * Returns true if no query (show all), or if query is found in title/content
     */
    private boolean matchesQuery(StudyNote note, String query) {
        if (query.isEmpty()) {
            return true; // No query filter, show all
        }
        
        String title = note.getTitle() != null ? note.getTitle().toLowerCase() : "";
        String content = note.getContent() != null ? note.getContent().toLowerCase() : "";
        
        // Must match in title or content (not just tags)
        return title.contains(query) || content.contains(query);
    }

    /**
     * Check if note matches all filters
     */
    private boolean matchesFilters(StudyNote note, SearchRequest request) {
        // Tag filter
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            Set<String> noteTags = note.getTags().stream()
                    .map(t -> t.getName().toLowerCase())
                    .collect(Collectors.toSet());
            boolean hasAllTags = request.getTags().stream()
                    .allMatch(tag -> noteTags.contains(tag.toLowerCase()));
            if (!hasAllTags) return false;
        }
        
        // Attachment filter
        if (Boolean.TRUE.equals(request.getHasAttachments())) {
            long attachmentCount = attachmentRepository.countByNoteId(note.getId());
            if (attachmentCount == 0) return false;
        }
        
        // Date filters
        if (request.getCreatedAfter() != null) {
            LocalDateTime created = note.getCreatedAt();
            if (created.toInstant(ZoneOffset.UTC).isBefore(request.getCreatedAfter())) return false;
        }
        if (request.getCreatedBefore() != null) {
            LocalDateTime created = note.getCreatedAt();
            if (created.toInstant(ZoneOffset.UTC).isAfter(request.getCreatedBefore())) return false;
        }
        if (request.getUpdatedAfter() != null) {
            LocalDateTime updated = note.getUpdatedAt();
            if (updated.toInstant(ZoneOffset.UTC).isBefore(request.getUpdatedAfter())) return false;
        }
        if (request.getUpdatedBefore() != null) {
            LocalDateTime updated = note.getUpdatedAt();
            if (updated.toInstant(ZoneOffset.UTC).isAfter(request.getUpdatedBefore())) return false;
        }
        
        return true;
    }

    /**
     * Create a SearchHit with relevance scoring
     */
    private SearchHit createSearchHit(StudyNote note, String query, List<String> queryTags) {
        SearchHit hit = new SearchHit();
        hit.setId(note.getId());
        hit.setTitle(note.getTitle());
        hit.setPublic(note.isPublic());
        hit.setCreatedAt(note.getCreatedAt().toInstant(ZoneOffset.UTC));
        hit.setUpdatedAt(note.getUpdatedAt().toInstant(ZoneOffset.UTC));
        
        // Content preview (first 200 chars)
        String content = note.getContent() != null ? note.getContent() : "";
        hit.setContentPreview(content.length() > 200 ? content.substring(0, 200) + "..." : content);
        
        // Tags
        List<String> allTags = note.getTags().stream()
                .map(Tag::getName)
                .sorted()
                .collect(Collectors.toList());
        hit.setAllTags(allTags);
        
        // Matched tags
        List<String> matchedTags = allTags.stream()
                .filter(tag -> queryTags.stream().anyMatch(qt -> qt.equalsIgnoreCase(tag)))
                .collect(Collectors.toList());
        hit.setMatchedTags(matchedTags);
        
        // Attachments
        long attachmentCount = attachmentRepository.countByNoteId(note.getId());
        hit.setAttachmentCount((int) attachmentCount);
        
        // View count
        long viewCount = noteViewRepository.countByNoteId(note.getId());
        hit.setViewCount(viewCount);
        
        // Calculate relevance score
        double score = calculateRelevanceScore(note, query, queryTags, viewCount, attachmentCount);
        hit.setRelevanceScore(score);
        
        // Highlights
        if (!query.isEmpty()) {
            hit.setHighlights(findHighlights(note, query));
        }
        
        return hit;
    }

    /**
     * Calculate relevance score based on multiple factors
     */
    private double calculateRelevanceScore(StudyNote note, String query, List<String> queryTags,
                                          long viewCount, long attachmentCount) {
        if (query.isEmpty() && queryTags.isEmpty()) {
            return 1.0; // Default score when no query
        }
        
        double score = 0.0;
        String title = note.getTitle() != null ? note.getTitle().toLowerCase() : "";
        String content = note.getContent() != null ? note.getContent().toLowerCase() : "";
        
        if (!query.isEmpty()) {
            // Exact title match (highest weight)
            if (title.equals(query)) {
                score += 100.0;
            } else if (title.contains(query)) {
                // Title contains query
                score += 50.0;
                // Bonus for query at start of title
                if (title.startsWith(query)) {
                    score += 20.0;
                }
            }
            
            // Content match
            if (content.contains(query)) {
                score += 20.0;
                // Count occurrences (up to 5)
                int occurrences = Math.min(5, countOccurrences(content, query));
                score += occurrences * 2.0;
            }
            
            // Tag name match
            for (Tag tag : note.getTags()) {
                if (tag.getName().toLowerCase().contains(query)) {
                    score += 15.0;
                    if (tag.getName().equalsIgnoreCase(query)) {
                        score += 10.0; // Exact tag match bonus
                    }
                }
            }
        }
        
        // Tag filter bonus
        if (!queryTags.isEmpty()) {
            Set<String> noteTags = note.getTags().stream()
                    .map(t -> t.getName().toLowerCase())
                    .collect(Collectors.toSet());
            long matchedCount = queryTags.stream()
                    .filter(qt -> noteTags.contains(qt.toLowerCase()))
                    .count();
            score += matchedCount * 10.0;
        }
        
        // Popularity boost (log scale to prevent runaway scores)
        if (viewCount > 0) {
            score += Math.log10(viewCount + 1) * 5.0;
        }
        
        // Attachment presence boost
        if (attachmentCount > 0) {
            score += Math.min(attachmentCount * 2.0, 10.0);
        }
        
        // Freshness boost (notes updated in last 7 days)
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        if (note.getUpdatedAt().isAfter(weekAgo)) {
            score += 5.0;
        }
        
        // Tag count bonus (well-organized notes)
        int tagCount = note.getTags().size();
        if (tagCount > 0 && tagCount <= 5) {
            score += tagCount;
        }
        
        return score;
    }

    private int countOccurrences(String text, String query) {
        int count = 0;
        int idx = 0;
        while ((idx = text.indexOf(query, idx)) != -1) {
            count++;
            idx += query.length();
        }
        return count;
    }

    /**
     * Find highlight matches in note
     */
    private List<SearchHit.HighlightMatch> findHighlights(StudyNote note, String query) {
        List<SearchHit.HighlightMatch> highlights = new ArrayList<>();
        String title = note.getTitle() != null ? note.getTitle() : "";
        String content = note.getContent() != null ? note.getContent() : "";
        
        // Find in title
        int titleIdx = title.toLowerCase().indexOf(query);
        if (titleIdx >= 0) {
            int start = Math.max(0, titleIdx - 20);
            int end = Math.min(title.length(), titleIdx + query.length() + 20);
            highlights.add(new SearchHit.HighlightMatch("title", title.substring(start, end), titleIdx, titleIdx + query.length()));
        }
        
        // Find in content (first 3 matches)
        int contentIdx = 0;
        int matchCount = 0;
        while ((contentIdx = content.toLowerCase().indexOf(query, contentIdx)) != -1 && matchCount < 3) {
            int start = Math.max(0, contentIdx - 30);
            int end = Math.min(content.length(), contentIdx + query.length() + 30);
            highlights.add(new SearchHit.HighlightMatch("content", content.substring(start, end), contentIdx, contentIdx + query.length()));
            contentIdx += query.length();
            matchCount++;
        }
        
        return highlights;
    }

    /**
     * Get comparator based on sort option
     */
    private Comparator<SearchHit> getComparator(String sort) {
        if (sort == null) sort = "relevance";
        
        return switch (sort.toLowerCase()) {
            case "date" -> Comparator.comparing(SearchHit::getCreatedAt).reversed();
            case "updated" -> Comparator.comparing(SearchHit::getUpdatedAt).reversed();
            case "popularity" -> Comparator.comparingLong(SearchHit::getViewCount).reversed();
            default -> Comparator.comparingDouble(SearchHit::getRelevanceScore).reversed();
        };
    }

    /**
     * Get related tags from search results
     */
    private List<SearchResult.TagSuggestion> getRelatedTags(String query, List<SearchHit> hits) {
        Map<String, Long> tagCounts = new HashMap<>();
        
        for (SearchHit hit : hits) {
            if (hit.getAllTags() != null) {
                for (String tag : hit.getAllTags()) {
                    tagCounts.merge(tag, 1L, Long::sum);
                }
            }
        }
        
        return tagCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(e -> new SearchResult.TagSuggestion(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    /**
     * Get search suggestions for zero-result queries
     */
    private List<String> getSuggestions(String query, boolean noResults) {
        if (!noResults || query == null || query.isBlank()) {
            return Collections.emptyList();
        }
        
        // Get popular queries that are similar
        List<String> suggestions = new ArrayList<>();
        Instant since = Instant.now().minus(30, ChronoUnit.DAYS);
        
        List<Object[]> topQueries = analyticsRepository.findTopQueries(since, 20);
        for (Object[] row : topQueries) {
            String topQuery = (String) row[0];
            if (topQuery != null && !topQuery.equalsIgnoreCase(query) && 
                (topQuery.toLowerCase().contains(query.toLowerCase()) || 
                 query.toLowerCase().contains(topQuery.toLowerCase()))) {
                suggestions.add(topQuery);
                if (suggestions.size() >= 5) break;
            }
        }
        
        return suggestions;
    }

    /**
     * Track search for analytics
     */
    private void trackSearch(SearchRequest request, UUID userId, int resultCount, boolean isPublic) {
        SearchAnalytics analytics = new SearchAnalytics();
        analytics.setQuery(request.getQuery() != null ? request.getQuery() : "");
        analytics.setUserId(userId);
        analytics.setResultCount(resultCount);
        analytics.setPublicSearch(isPublic);
        analytics.setTimestamp(Instant.now());
        analytics.setSortOption(request.getSort());
        analytics.setHasAttachmentFilter(request.getHasAttachments());
        
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            analytics.setTagsUsed(String.join(",", request.getTags()));
        }
        
        analyticsRepository.save(analytics);
    }

    /**
     * Track click on search result
     */
    @Transactional
    public void trackSearchClick(UUID searchId, UUID noteId, int position) {
        // Find recent search by user and update it
        // For simplicity, we create a new click event
        SearchAnalytics click = new SearchAnalytics();
        click.setQuery(""); // Will be linked by timing
        click.setClickedNoteId(noteId);
        click.setClickPosition(position);
        click.setTimestamp(Instant.now());
        analyticsRepository.save(click);
    }

    /**
     * Track click on public search result (anonymous users)
     */
    @Transactional
    public void trackPublicSearchClick(UUID noteId, int position) {
        // Create a public search click event
        SearchAnalytics click = new SearchAnalytics();
        click.setQuery(""); // Will be linked by timing
        click.setClickedNoteId(noteId);
        click.setClickPosition(position);
        click.setTimestamp(Instant.now());
        click.setPublicSearch(true);
        analyticsRepository.save(click);
    }

    /**
     * Get search analytics dashboard data
     */
    @Transactional(readOnly = true)
    public SearchAnalyticsDto getSearchAnalytics(int days) {
        Instant since = Instant.now().minus(days, ChronoUnit.DAYS);
        
        SearchAnalyticsDto dto = new SearchAnalyticsDto();
        dto.setTotalSearches(analyticsRepository.countSearchesSince(since));
        dto.setAverageResultCount(analyticsRepository.getAverageResultCount(since));
        dto.setClickThroughRate(analyticsRepository.getClickThroughRate(since));
        
        // Top queries
        List<Object[]> topQueries = analyticsRepository.findTopQueries(since, 10);
        dto.setTopQueries(topQueries.stream()
                .map(row -> new SearchAnalyticsDto.QueryCount((String) row[0], ((Number) row[1]).longValue()))
                .collect(Collectors.toList()));
        
        // Zero result queries
        List<Object[]> zeroResults = analyticsRepository.findZeroResultQueries(since);
        dto.setZeroResultQueries(zeroResults.stream()
                .limit(10)
                .map(row -> new SearchAnalyticsDto.QueryCount((String) row[0], ((Number) row[1]).longValue()))
                .collect(Collectors.toList()));
        
        // Search trend
        List<Object[]> trend = analyticsRepository.findSearchFrequencyByDay(since);
        dto.setSearchTrend(trend.stream()
                .map(row -> new SearchAnalyticsDto.DailyCount(row[0].toString(), ((Number) row[1]).longValue()))
                .collect(Collectors.toList()));
        
        // Popular tags in searches
        List<Object[]> tags = analyticsRepository.findPopularSearchTags(since, 10);
        List<SearchAnalyticsDto.TagCount> tagCounts = new ArrayList<>();
        for (Object[] row : tags) {
            String tagsStr = (String) row[0];
            long count = ((Number) row[1]).longValue();
            // Split comma-separated tags and count individually
            for (String tag : tagsStr.split(",")) {
                tag = tag.trim();
                if (!tag.isEmpty()) {
                    tagCounts.add(new SearchAnalyticsDto.TagCount(tag, count));
                }
            }
        }
        dto.setPopularTags(tagCounts.stream()
                .limit(10)
                .collect(Collectors.toList()));
        
        return dto;
    }

    /**
     * Get autosuggest results
     */
    @Transactional(readOnly = true)
    public List<String> getAutosuggest(String prefix, User user, int limit) {
        if (prefix == null || prefix.length() < 2) {
            return Collections.emptyList();
        }
        
        Set<String> suggestions = new LinkedHashSet<>();
        String lowerPrefix = prefix.toLowerCase();
        
        // Get tag suggestions
        List<Tag> tags = tagRepository.findAll();
        for (Tag tag : tags) {
            if (tag.getName().toLowerCase().startsWith(lowerPrefix)) {
                suggestions.add("tag:" + tag.getName());
            }
        }
        
        // Get title suggestions from user's notes
        if (user != null) {
            List<StudyNote> userNotes = noteRepository.findByUserOrderByCreatedAtDesc(user);
            for (StudyNote note : userNotes) {
                if (note.getTitle() != null && note.getTitle().toLowerCase().contains(lowerPrefix)) {
                    suggestions.add(note.getTitle());
                }
            }
        }
        
        // Get popular searches
        Instant since = Instant.now().minus(30, ChronoUnit.DAYS);
        List<Object[]> popularQueries = analyticsRepository.findTopQueries(since, 20);
        for (Object[] row : popularQueries) {
            String query = (String) row[0];
            if (query != null && query.toLowerCase().startsWith(lowerPrefix)) {
                suggestions.add(query);
            }
        }
        
        return suggestions.stream().limit(limit).collect(Collectors.toList());
    }

    // ============ Legacy methods for backward compatibility ============

    @Transactional(readOnly = true)
    public List<SearchResultDto> searchUserNotes(String query, String tag, User user) {
        List<StudyNote> notes;
        boolean hasQuery = query != null && !query.isBlank();
        boolean hasTag = tag != null && !tag.isBlank();
        
        if (!hasQuery) {
            notes = hasTag ? noteRepository.findByTagNameForUser(tag, user) 
                          : noteRepository.findByUserOrderByCreatedAtDesc(user);
            return notes.stream().map(n -> toResult(n, null)).collect(Collectors.toList());
        }
        
        notes = hasTag ? noteRepository.fullTextSearchByTagForUser(query.trim(), tag, user.getId())
                       : noteRepository.fullTextSearchForUser(query.trim(), user.getId());
        return notes.stream().map(n -> toResult(n, query)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SearchResultDto> searchPublicNotes(String query, String tag) {
        List<StudyNote> notes;
        boolean hasQuery = query != null && !query.isBlank();
        boolean hasTag = tag != null && !tag.isBlank();
        
        if (!hasQuery) {
            notes = hasTag ? noteRepository.findPublicByTagName(tag) : noteRepository.findAllPublicNotes();
            return notes.stream().map(n -> toResult(n, null)).collect(Collectors.toList());
        }
        
        notes = hasTag ? noteRepository.fullTextSearchPublicByTag(query.trim(), tag)
                       : noteRepository.fullTextSearchPublic(query.trim());
        return notes.stream().map(n -> toResult(n, query)).collect(Collectors.toList());
    }

    private SearchResultDto toResult(StudyNote note, String query) {
        NoteAnalytics analytics = noteViewService.getSafeAnalytics(note.getId());
        List<String> tags = note.getTags().stream().map(t -> t.getName()).sorted().toList();
        String hlTitle = null, hlContent = null;
        
        if (query != null) {
            try {
                hlTitle = noteRepository.getSearchHeadline(note.getTitle(), query);
                hlContent = noteRepository.getSearchHeadline(note.getContent(), query);
            } catch (Exception ignored) {}
        }
        
        return new SearchResultDto(note.getId(), note.getTitle(), note.getContent(),
            hlTitle, hlContent, tags, note.isPublic(), note.getReadingTimeMinutes(),
            note.getWordCount(), note.getCreatedAt(), note.getUpdatedAt(), 0.0, analytics);
    }
}
