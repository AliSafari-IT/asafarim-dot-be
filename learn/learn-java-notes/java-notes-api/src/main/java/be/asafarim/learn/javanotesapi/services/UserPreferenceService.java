package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.UserPreferenceDto;
import be.asafarim.learn.javanotesapi.entities.User;
import be.asafarim.learn.javanotesapi.entities.UserPreference;
import be.asafarim.learn.javanotesapi.repositories.UserPreferenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserPreferenceService {

    private final UserPreferenceRepository repository;
    private final AuthService authService;

    public UserPreferenceService(UserPreferenceRepository repository, AuthService authService) {
        this.repository = repository;
        this.authService = authService;
    }

    /**
     * Get preferences for current user, creating defaults if not exists
     */
    @Transactional
    public UserPreferenceDto getMyPreferences() {
        User user = authService.getCurrentUser();
        UserPreference pref = repository.findByUser(user)
                .orElseGet(() -> {
                    UserPreference newPref = new UserPreference(user);
                    return repository.save(newPref);
                });
        return toDto(pref);
    }

    /**
     * Update preferences for current user
     */
    @Transactional
    public UserPreferenceDto updateMyPreferences(UserPreferenceDto.UpdateRequest request) {
        User user = authService.getCurrentUser();
        UserPreference pref = repository.findByUser(user)
                .orElseGet(() -> {
                    UserPreference newPref = new UserPreference(user);
                    return repository.save(newPref);
                });

        // Update only provided fields
        if (request.getNotesPerPage() != null) {
            pref.setNotesPerPage(request.getNotesPerPage());
        }
        if (request.getTheme() != null) {
            pref.setTheme(request.getTheme());
        }
        if (request.getLanguage() != null) {
            pref.setLanguage(request.getLanguage());
        }

        repository.save(pref);
        return toDto(pref);
    }

    /**
     * Get notesPerPage preference for current user (with default)
     */
    public int getNotesPerPageForCurrentUser() {
        try {
            User user = authService.getCurrentUser();
            return repository.findByUser(user)
                    .map(UserPreference::getNotesPerPage)
                    .orElse(10);
        } catch (Exception e) {
            return 10; // Default for anonymous users
        }
    }

    /**
     * Initialize preferences for a new user
     */
    @Transactional
    public void initializePreferencesForUser(User user) {
        if (!repository.existsByUser(user)) {
            UserPreference pref = new UserPreference(user);
            repository.save(pref);
        }
    }

    private UserPreferenceDto toDto(UserPreference pref) {
        return new UserPreferenceDto(
            pref.getNotesPerPage(),
            pref.getTheme(),
            pref.getLanguage(),
            pref.getUpdatedAt()
        );
    }
}
