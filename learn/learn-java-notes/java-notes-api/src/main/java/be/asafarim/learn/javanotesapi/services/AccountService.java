package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.AccountDto.*;
import be.asafarim.learn.javanotesapi.entities.AccountActivity;
import be.asafarim.learn.javanotesapi.entities.AccountActivity.ActivityType;
import be.asafarim.learn.javanotesapi.entities.User;
import be.asafarim.learn.javanotesapi.entities.UserPreference;
import be.asafarim.learn.javanotesapi.entities.UserSession;
import be.asafarim.learn.javanotesapi.repositories.AccountActivityRepository;
import be.asafarim.learn.javanotesapi.repositories.UserPreferenceRepository;
import be.asafarim.learn.javanotesapi.repositories.UserRepository;
import be.asafarim.learn.javanotesapi.repositories.UserSessionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AccountService {

    private final UserRepository userRepository;
    private final UserSessionRepository sessionRepository;
    private final AccountActivityRepository activityRepository;
    private final UserPreferenceRepository preferenceRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.upload.avatar-dir:uploads/avatars}")
    private String avatarUploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public AccountService(
            UserRepository userRepository,
            UserSessionRepository sessionRepository,
            AccountActivityRepository activityRepository,
            UserPreferenceRepository preferenceRepository,
            AuthService authService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.activityRepository = activityRepository;
        this.preferenceRepository = preferenceRepository;
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
    }

    // ============ Profile Methods ============

    @Transactional(readOnly = true)
    public ProfileResponse getProfile() {
        User user = authService.getCurrentUser();
        return toProfileResponse(user);
    }

    public SuccessResponse updateProfile(UpdateProfileRequest request, String ipAddress) {
        User user = authService.getCurrentUser();

        if (request.displayName() != null && !request.displayName().isBlank()) {
            user.setDisplayName(request.displayName());
        }

        if (request.email() != null && !request.email().isBlank()) {
            // Check if email is already taken by another user
            if (!user.getEmail().equals(request.email()) && 
                userRepository.existsByEmail(request.email())) {
                throw new RuntimeException("Email is already in use");
            }
            user.setEmail(request.email());
            logActivity(user, ActivityType.EMAIL_CHANGE, "Email changed", ipAddress);
        }

        userRepository.save(user);
        logActivity(user, ActivityType.PROFILE_UPDATE, "Profile updated", ipAddress);

        return new SuccessResponse(true, "Profile updated successfully");
    }

    public AvatarResponse uploadAvatar(MultipartFile file, String ipAddress) throws IOException {
        User user = authService.getCurrentUser();

        // Validate file
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }

        // Create upload directory if not exists
        Path uploadPath = Paths.get(avatarUploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String extension = getFileExtension(file.getOriginalFilename());
        String filename = user.getId().toString() + "_" + System.currentTimeMillis() + extension;
        Path filePath = uploadPath.resolve(filename);

        // Save file
        Files.copy(file.getInputStream(), filePath);

        // Update user avatar URL
        String avatarUrl = baseUrl + "/api/avatars/" + filename;
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);

        logActivity(user, ActivityType.AVATAR_CHANGE, "Avatar updated", ipAddress);

        return new AvatarResponse(avatarUrl);
    }

    // ============ Password Methods ============

    public SuccessResponse changePassword(ChangePasswordRequest request, String ipAddress) {
        User user = authService.getCurrentUser();

        // Verify current password
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Validate new password
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new RuntimeException("New passwords do not match");
        }

        if (request.newPassword().length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        logActivity(user, ActivityType.PASSWORD_CHANGE, "Password changed", ipAddress);

        return new SuccessResponse(true, "Password changed successfully");
    }

    // ============ Session Methods ============

    @Transactional(readOnly = true)
    public List<SessionResponse> getActiveSessions(String currentTokenHash) {
        User user = authService.getCurrentUser();
        List<UserSession> sessions = sessionRepository.findActiveSessionsByUser(user, LocalDateTime.now());

        return sessions.stream()
                .map(s -> new SessionResponse(
                        s.getId(),
                        s.getDeviceName(),
                        s.getIpAddress(),
                        s.getLastActive(),
                        s.getCreatedAt(),
                        currentTokenHash != null && currentTokenHash.equals(s.getTokenHash())
                ))
                .collect(Collectors.toList());
    }

    public SuccessResponse logoutSession(UUID sessionId, String ipAddress) {
        User user = authService.getCurrentUser();
        UserSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        sessionRepository.delete(session);
        logActivity(user, ActivityType.SESSION_REVOKED, "Session revoked", ipAddress);

        return new SuccessResponse(true, "Session logged out");
    }

    public SuccessResponse logoutAllSessions(String ipAddress) {
        User user = authService.getCurrentUser();
        sessionRepository.deleteAllByUser(user);
        logActivity(user, ActivityType.SESSION_REVOKED, "All sessions revoked", ipAddress);

        return new SuccessResponse(true, "All sessions logged out");
    }

    // ============ Activity Methods ============

    @Transactional(readOnly = true)
    public List<ActivityResponse> getAccountActivity() {
        User user = authService.getCurrentUser();
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        List<AccountActivity> activities = activityRepository.findRecentActivityByUser(user, since);

        return activities.stream()
                .map(a -> new ActivityResponse(
                        a.getId(),
                        a.getType().name().toLowerCase(),
                        a.getDescription(),
                        a.getCreatedAt(),
                        a.getIpAddress(),
                        a.getDeviceName()
                ))
                .collect(Collectors.toList());
    }

    // ============ Preferences Methods ============

    @Transactional(readOnly = true)
    public PreferencesResponse getPreferences() {
        User user = authService.getCurrentUser();
        UserPreference pref = preferenceRepository.findByUser(user)
                .orElseGet(() -> createDefaultPreferences(user));

        return new PreferencesResponse(
                pref.getTheme().toLowerCase(),
                pref.getLanguage(),
                pref.isEmailNotifications(),
                pref.getDefaultEditor()
        );
    }

    public PreferencesResponse updatePreferences(UpdatePreferencesRequest request, String ipAddress) {
        User user = authService.getCurrentUser();
        UserPreference pref = preferenceRepository.findByUser(user)
                .orElseGet(() -> createDefaultPreferences(user));

        if (request.theme() != null) {
            pref.setTheme(request.theme().toUpperCase());
        }
        if (request.language() != null) {
            pref.setLanguage(request.language());
        }
        if (request.emailNotifications() != null) {
            pref.setEmailNotifications(request.emailNotifications());
        }
        if (request.defaultEditor() != null) {
            pref.setDefaultEditor(request.defaultEditor());
        }

        preferenceRepository.save(pref);
        logActivity(user, ActivityType.PREFERENCES_UPDATE, "Preferences updated", ipAddress);

        return getPreferences();
    }

    // ============ Export Methods ============

    public ExportDataResponse exportAccountData(String ipAddress) {
        User user = authService.getCurrentUser();
        
        // TODO: Implement actual data export (generate JSON/ZIP file)
        // For now, return a data URL that can be used to download user data as JSON
        String userData = generateUserDataJson(user);
        String dataUrl = "data:application/json;base64," + java.util.Base64.getEncoder().encodeToString(userData.getBytes());
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(24);

        logActivity(user, ActivityType.PROFILE_UPDATE, "Data export requested", ipAddress);

        return new ExportDataResponse(dataUrl, expiresAt);
    }

    private String generateUserDataJson(User user) {
        // Generate a simple JSON export of user data
        return String.format(
            "{\"id\":\"%s\",\"username\":\"%s\",\"email\":\"%s\",\"displayName\":\"%s\",\"createdAt\":\"%s\"}",
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getDisplayName() != null ? user.getDisplayName() : user.getUsername(),
            user.getCreatedAt()
        );
    }

    // ============ Account Actions ============

    public SuccessResponse deactivateAccount(String ipAddress) {
        User user = authService.getCurrentUser();
        user.setEnabled(false);
        userRepository.save(user);

        logActivity(user, ActivityType.ACCOUNT_DEACTIVATED, "Account deactivated", ipAddress);
        sessionRepository.deleteAllByUser(user);

        return new SuccessResponse(true, "Account deactivated");
    }

    public SuccessResponse deleteAccount(DeleteAccountRequest request, String ipAddress) {
        User user = authService.getCurrentUser();

        // Verify password
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Password is incorrect");
        }

        // Delete all user data
        sessionRepository.deleteAllByUser(user);
        // TODO: Delete notes, preferences, etc.

        // Delete user
        userRepository.delete(user);

        return new SuccessResponse(true, "Account deleted");
    }

    // ============ Helper Methods ============

    private void logActivity(User user, ActivityType type, String description, String ipAddress) {
        AccountActivity activity = new AccountActivity(user, type, description, ipAddress);
        activityRepository.save(activity);
    }

    private UserPreference createDefaultPreferences(User user) {
        UserPreference pref = new UserPreference(user);
        return preferenceRepository.save(pref);
    }

    private ProfileResponse toProfileResponse(User user) {
        List<String> roles = user.getRoles().stream()
                .map(r -> "ROLE_" + r.getName())
                .collect(Collectors.toList());

        return new ProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                roles,
                user.isLocked(),
                user.getLockReason(),
                user.getLockedAt(),
                user.getLastLogin(),
                user.getLastLoginIp(),
                user.getFailedLoginAttempts(),
                user.getCreatedAt()
        );
    }

    private String getFileExtension(String filename) {
        if (filename == null) return ".jpg";
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot) : ".jpg";
    }

    // ============ Session Management (called from auth) ============

    public void createSession(User user, String tokenHash, String deviceName, String ipAddress, String userAgent, LocalDateTime expiresAt) {
        UserSession session = new UserSession(user, deviceName, ipAddress, userAgent);
        session.setTokenHash(tokenHash);
        session.setExpiresAt(expiresAt);
        sessionRepository.save(session);
    }

    public void recordLogin(User user, String ipAddress) {
        user.setLastLogin(LocalDateTime.now());
        user.setLastLoginIp(ipAddress);
        user.resetFailedLoginAttempts();
        userRepository.save(user);
        logActivity(user, ActivityType.LOGIN, "User logged in", ipAddress);
    }

    public void recordFailedLogin(User user, String ipAddress) {
        user.incrementFailedLoginAttempts();
        userRepository.save(user);
        logActivity(user, ActivityType.FAILED_LOGIN, "Failed login attempt", ipAddress);
    }
}
