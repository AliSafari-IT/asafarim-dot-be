package be.asafarim.learn.javanotesapi.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_action", columnList = "action"),
    @Index(name = "idx_audit_entity_type", columnList = "entity_type"),
    @Index(name = "idx_audit_user_id", columnList = "user_id"),
    @Index(name = "idx_audit_created_at", columnList = "created_at")
})
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String action;

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;

    @Column(name = "entity_id")
    private UUID entityId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "user_name", length = 100)
    private String userName;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(length = 20)
    private String severity;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public AuditLog() {
        this.createdAt = LocalDateTime.now();
        this.severity = "INFO";
    }

    public AuditLog(String action, String entityType, UUID entityId, UUID userId, String userName) {
        this();
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.userId = userId;
        this.userName = userName;
    }

    // Static factory methods for common audit events
    public static AuditLog userCreated(UUID userId, String userName, UUID createdByUserId, String createdByUserName) {
        AuditLog log = new AuditLog("USER_CREATED", "USER", userId, createdByUserId, createdByUserName);
        log.setDetails("User '" + userName + "' was created");
        return log;
    }

    public static AuditLog userDeleted(UUID userId, String userName, UUID deletedByUserId, String deletedByUserName) {
        AuditLog log = new AuditLog("USER_DELETED", "USER", userId, deletedByUserId, deletedByUserName);
        log.setDetails("User '" + userName + "' was deleted");
        log.setSeverity("WARN");
        return log;
    }

    public static AuditLog userLocked(UUID userId, String userName, UUID lockedByUserId, String lockedByUserName) {
        AuditLog log = new AuditLog("USER_LOCKED", "USER", userId, lockedByUserId, lockedByUserName);
        log.setDetails("User '" + userName + "' was locked");
        log.setSeverity("WARN");
        return log;
    }

    public static AuditLog roleChanged(UUID userId, String userName, String oldRoles, String newRoles, UUID changedByUserId, String changedByUserName) {
        AuditLog log = new AuditLog("ROLE_CHANGED", "USER", userId, changedByUserId, changedByUserName);
        log.setOldValue(oldRoles);
        log.setNewValue(newRoles);
        log.setDetails("User '" + userName + "' roles changed from [" + oldRoles + "] to [" + newRoles + "]");
        return log;
    }

    public static AuditLog permissionChanged(UUID roleId, String roleName, String oldPermissions, String newPermissions, UUID changedByUserId, String changedByUserName) {
        AuditLog log = new AuditLog("PERMISSION_CHANGED", "ROLE", roleId, changedByUserId, changedByUserName);
        log.setOldValue(oldPermissions);
        log.setNewValue(newPermissions);
        log.setDetails("Role '" + roleName + "' permissions updated");
        return log;
    }

    public static AuditLog noteVisibilityChanged(UUID noteId, String noteTitle, String oldVisibility, String newVisibility, UUID changedByUserId, String changedByUserName) {
        AuditLog log = new AuditLog("VISIBILITY_CHANGED", "NOTE", noteId, changedByUserId, changedByUserName);
        log.setOldValue(oldVisibility);
        log.setNewValue(newVisibility);
        log.setDetails("Note '" + noteTitle + "' visibility changed from " + oldVisibility + " to " + newVisibility);
        return log;
    }

    public static AuditLog loginFailed(String userName, String ipAddress, String reason) {
        AuditLog log = new AuditLog("LOGIN_FAILED", "AUTH", null, null, userName);
        log.setIpAddress(ipAddress);
        log.setDetails("Login failed: " + reason);
        log.setSeverity("WARN");
        return log;
    }

    public static AuditLog impersonationStarted(UUID targetUserId, String targetUserName, UUID adminUserId, String adminUserName) {
        AuditLog log = new AuditLog("IMPERSONATION_STARTED", "USER", targetUserId, adminUserId, adminUserName);
        log.setDetails("Admin '" + adminUserName + "' started impersonating user '" + targetUserName + "'");
        log.setSeverity("WARN");
        return log;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public UUID getEntityId() { return entityId; }
    public void setEntityId(UUID entityId) { this.entityId = entityId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getOldValue() { return oldValue; }
    public void setOldValue(String oldValue) { this.oldValue = oldValue; }

    public String getNewValue() { return newValue; }
    public void setNewValue(String newValue) { this.newValue = newValue; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
