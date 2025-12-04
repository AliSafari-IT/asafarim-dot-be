package be.asafarim.learn.javanotesapi.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity to track user account activity
 */
@Entity
@Table(name = "account_activities")
public class AccountActivity {

    public enum ActivityType {
        LOGIN,
        LOGOUT,
        PASSWORD_CHANGE,
        EMAIL_CHANGE,
        PROFILE_UPDATE,
        AVATAR_CHANGE,
        PREFERENCES_UPDATE,
        SESSION_REVOKED,
        ACCOUNT_LOCKED,
        ACCOUNT_UNLOCKED,
        ACCOUNT_DEACTIVATED,
        ACCOUNT_REACTIVATED,
        FAILED_LOGIN
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ActivityType type;

    @Column(length = 500)
    private String description;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "device_name", length = 255)
    private String deviceName;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public AccountActivity() {
        this.createdAt = LocalDateTime.now();
    }

    public AccountActivity(User user, ActivityType type, String description) {
        this();
        this.user = user;
        this.type = type;
        this.description = description;
    }

    public AccountActivity(User user, ActivityType type, String description, String ipAddress) {
        this(user, type, description);
        this.ipAddress = ipAddress;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public ActivityType getType() { return type; }
    public void setType(ActivityType type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getDeviceName() { return deviceName; }
    public void setDeviceName(String deviceName) { this.deviceName = deviceName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
