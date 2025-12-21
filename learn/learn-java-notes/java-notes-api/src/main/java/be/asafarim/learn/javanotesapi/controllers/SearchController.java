package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.dto.*;
import be.asafarim.learn.javanotesapi.entities.User;
import be.asafarim.learn.javanotesapi.repositories.UserRepository;
import be.asafarim.learn.javanotesapi.services.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/search")
public class SearchController {
    private final SearchService searchService;
    private final UserRepository userRepository;

    public SearchController(SearchService searchService, UserRepository userRepository) {
        this.searchService = searchService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<SearchResultDto>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String tag,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<SearchResultDto> results = searchService.searchUserNotes(q, tag, user);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/public")
    public ResponseEntity<List<SearchResultDto>> searchPublic(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String tag) {
        List<SearchResultDto> results = searchService.searchPublicNotes(q, tag);
        return ResponseEntity.ok(results);
    }

    // ============ Advanced Search 2.0 Endpoints ============

    /**
     * Advanced search for authenticated users
     * POST /api/search/advanced
     */
    @PostMapping("/advanced")
    public ResponseEntity<SearchResult> advancedSearch(
            @RequestBody SearchRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            SearchResult result = searchService.advancedSearch(request, user);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Public advanced search
     * POST /api/search/public/advanced
     */
    @PostMapping("/public/advanced")
    public ResponseEntity<SearchResult> publicAdvancedSearch(@RequestBody SearchRequest request) {
        try {
            SearchResult result = searchService.publicSearch(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get autosuggest results
     * GET /api/search/suggest?q=prefix
     */
    @GetMapping("/suggest")
    public ResponseEntity<List<String>> getSuggestions(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = null;
            if (userDetails != null) {
                user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            }
            List<String> suggestions = searchService.getAutosuggest(q, user, limit);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Track search result click (authenticated users)
     * POST /api/search/click
     */
    @PostMapping("/click")
    public ResponseEntity<Void> trackClick(
            @RequestParam UUID noteId,
            @RequestParam(defaultValue = "0") int position) {
        try {
            searchService.trackSearchClick(null, noteId, position);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Track public search result click (anonymous users)
     * POST /api/search/public/click
     */
    @PostMapping("/public/click")
    public ResponseEntity<Void> trackPublicClick(
            @RequestParam UUID noteId,
            @RequestParam(defaultValue = "0") int position) {
        try {
            searchService.trackPublicSearchClick(noteId, position);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get search analytics dashboard data
     * GET /api/search/analytics
     */
    @GetMapping("/analytics")
    public ResponseEntity<SearchAnalyticsDto> getAnalytics(
            @RequestParam(defaultValue = "30") int days) {
        try {
            SearchAnalyticsDto analytics = searchService.getSearchAnalytics(days);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
