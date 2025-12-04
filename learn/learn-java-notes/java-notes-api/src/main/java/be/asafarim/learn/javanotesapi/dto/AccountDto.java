package be.asafarim.learn.javanotesapi.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTOs for Account management endpoints
 */
public class AccountDto {

    // ============ Profile DTOs ============

    public record ProfileResponse(
        UUID id,
        String username,
        String email,
        String displayName,
        String avatarUrl,
        List<String> roles,
        boolean locked,
        String lockReason,
        LocalDateTime lockedAt,
        LocalDateTime lastLogin,
        String lastLoginIp,
        int failedLoginAttempts,
        LocalDateTime createdAt
    ) {}

    public record UpdateProfileRequest(
        String displayName,
        String email
    ) {}

    // ============ Password DTOs ============

    public record ChangePasswordRequest(
        String currentPassword,
        String newPassword,
        String confirmPassword
    ) {}

    // ============ Session DTOs ============

    public record SessionResponse(
        UUID id,
        String deviceName,
        String ipAddress,
        LocalDateTime lastActive,
        LocalDateTime createdAt,
        boolean isCurrent
    ) {}

    // ============ Activity DTOs ============

    public record ActivityResponse(
        UUID id,
        String type,
        String description,
        LocalDateTime timestamp,
        String ipAddress,
        String deviceName
    ) {}

    // ============ Preferences DTOs ============

    public record PreferencesResponse(
        String theme,
        String language,
        boolean emailNotifications,
        String defaultEditor
    ) {}

    public record UpdatePreferencesRequest(
        String theme,
        String language,
        Boolean emailNotifications,
        String defaultEditor
    ) {}

    // ============ Export DTOs ============

    public record ExportDataResponse(
        String downloadUrl,
        LocalDateTime expiresAt
    ) {}

    // ============ Generic Response DTOs ============

    public record SuccessResponse(
        boolean success,
        String message
    ) {}

    public record AvatarResponse(
        String avatarUrl
    ) {}

    // ============ Delete Account DTO ============

    public record DeleteAccountRequest(
        String password
    ) {}
}
