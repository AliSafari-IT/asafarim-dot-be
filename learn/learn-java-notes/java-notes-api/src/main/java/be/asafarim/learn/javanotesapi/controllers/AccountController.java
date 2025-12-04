package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.dto.AccountDto.*;
import be.asafarim.learn.javanotesapi.services.AccountService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * REST Controller for Account management endpoints
 * Matches the frontend accountSettingsApi.ts
 */
@RestController
@RequestMapping("/api/account")
@PreAuthorize("isAuthenticated()")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    // ============ Profile Endpoints ============

    /**
     * GET /api/account/profile - Get current user profile
     */
    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile() {
        return ResponseEntity.ok(accountService.getProfile());
    }

    /**
     * PUT /api/account/profile - Update user profile
     */
    @PutMapping("/profile")
    public ResponseEntity<SuccessResponse> updateProfile(
            @RequestBody UpdateProfileRequest request,
            HttpServletRequest httpRequest) {
        String ipAddress = getClientIp(httpRequest);
        return ResponseEntity.ok(accountService.updateProfile(request, ipAddress));
    }

    /**
     * POST /api/account/avatar - Upload avatar image
     */
    @PostMapping("/avatar")
    public ResponseEntity<AvatarResponse> uploadAvatar(
            @RequestParam("avatar") MultipartFile file,
            HttpServletRequest httpRequest) throws IOException {
        String ipAddress = getClientIp(httpRequest);
        return ResponseEntity.ok(accountService.uploadAvatar(file, ipAddress));
    }

    // ============ Password Endpoints ============

    /**
     * PUT /api/account/password - Change password
     */
    @PutMapping("/password")
    public ResponseEntity<SuccessResponse> changePassword(
            @RequestBody ChangePasswordRequest request,
            HttpServletRequest httpRequest) {
        String ipAddress = getClientIp(httpRequest);
        return ResponseEntity.ok(accountService.changePassword(request, ipAddress));
    }

    // ============ Session Endpoints ============

    /**
     * GET /api/account/sessions - Get active sessions
     */
    @GetMapping("/sessions")
    public ResponseEntity<List<SessionResponse>> getActiveSessions(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String tokenHash = extractTokenHash(authHeader);
        return ResponseEntity.ok(accountService.getActiveSessions(tokenHash));
    }

    /**
     * DELETE /api/account/sessions/{sessionId} - Logout specific session
     */
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<SuccessResponse> logoutSession(
            @PathVariable UUID sessionId,
            HttpServletRequest httpRequest) {
        String ipAddress = getClientIp(httpRequest);
        return ResponseEntity.ok(accountService.logoutSession(sessionId, ipAddress));
    }

    /**
     * POST /api/account/sessions/logout-all - Logout all sessions
     */
    @PostMapping("/sessions/logout-all")
    public ResponseEntity<SuccessResponse> logoutAllSessions(HttpServletRequest httpRequest) {
        String ipAddress = getClientIp(httpRequest);
        return ResponseEntity.ok(accountService.logoutAllSessions(ipAddress));
    }

    // ============ Activity Endpoints ============

    /**
     * GET /api/account/activity - Get account activity
     */
    @GetMapping("/activity")
    public ResponseEntity<List<ActivityResponse>> getAccountActivity() {
        return ResponseEntity.ok(accountService.getAccountActivity());
    }

    // ============ Preferences Endpoints ============

    /**
     * GET /api/account/preferences - Get user preferences
     */
    @GetMapping("/preferences")
    public ResponseEntity<PreferencesResponse> getPreferences() {
        return ResponseEntity.ok(accountService.getPreferences());
    }

    /**
     * PUT /api/account/preferences - Update user preferences
     */
    @PutMapping("/preferences")
    public ResponseEntity<PreferencesResponse> updatePreferences(
            @RequestBody UpdatePreferencesRequest request,
            HttpServletRequest httpRequest) {
        String ipAddress = getClientIp(httpRequest);
        return ResponseEntity.ok(accountService.updatePreferences(request, ipAddress));
    }

    // ============ Export Endpoints ============

    /**
     * POST /api/account/export - Request data export
     */
    @PostMapping("/export")
    public ResponseEntity<ExportDataResponse> exportAccountData(HttpServletRequest httpRequest) {
        String ipAddress = getClientIp(httpRequest);
        return ResponseEntity.ok(accountService.exportAccountData(ipAddress));
    }

    // ============ Account Actions ============

    /**
     * POST /api/account/deactivate - Deactivate account
     */
    @PostMapping("/deactivate")
    public ResponseEntity<SuccessResponse> deactivateAccount(HttpServletRequest httpRequest) {
        String ipAddress = getClientIp(httpRequest);
        return ResponseEntity.ok(accountService.deactivateAccount(ipAddress));
    }

    /**
     * DELETE /api/account/delete - Delete account permanently
     */
    @DeleteMapping("/delete")
    public ResponseEntity<SuccessResponse> deleteAccount(
            @RequestBody DeleteAccountRequest request,
            HttpServletRequest httpRequest) {
        String ipAddress = getClientIp(httpRequest);
        return ResponseEntity.ok(accountService.deleteAccount(request, ipAddress));
    }

    // ============ Helper Methods ============

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    private String extractTokenHash(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            // Simple hash for comparison - in production use proper hashing
            return String.valueOf(token.hashCode());
        }
        return null;
    }
}
