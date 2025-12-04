package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.dto.UserPreferenceDto;
import be.asafarim.learn.javanotesapi.services.UserPreferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for user preferences (theme, language, notes per page)
 */
@RestController
@RequestMapping("/api/users/me/preferences")
@CrossOrigin(origins = "*")
public class UserPreferenceController {

    private final UserPreferenceService preferenceService;

    public UserPreferenceController(UserPreferenceService preferenceService) {
        this.preferenceService = preferenceService;
    }

    /**
     * Get current user's preferences
     */
    @GetMapping
    public ResponseEntity<UserPreferenceDto> getPreferences() {
        return ResponseEntity.ok(preferenceService.getMyPreferences());
    }

    /**
     * Update current user's preferences
     */
    @PutMapping
    public ResponseEntity<UserPreferenceDto> updatePreferences(
            @RequestBody UserPreferenceDto.UpdateRequest request) {
        return ResponseEntity.ok(preferenceService.updateMyPreferences(request));
    }
}
