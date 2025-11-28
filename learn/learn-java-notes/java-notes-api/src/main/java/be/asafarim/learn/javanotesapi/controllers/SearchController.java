package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.dto.SearchResultDto;
import be.asafarim.learn.javanotesapi.entities.User;
import be.asafarim.learn.javanotesapi.repositories.UserRepository;
import be.asafarim.learn.javanotesapi.services.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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
}
