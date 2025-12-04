package be.asafarim.learn.javanotesapi.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "system_settings")
public class SystemSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "setting_key", unique = true, nullable = false, length = 100)
    private String key;

    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String value;

    @Column(length = 255)
    private String description;

    @Column(length = 50)
    private String category;

    @Column(name = "value_type", length = 20)
    private String valueType;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private UUID updatedBy;

    public SystemSetting() {
        this.updatedAt = LocalDateTime.now();
        this.valueType = "STRING";
    }

    public SystemSetting(String key, String value, String description, String category) {
        this();
        this.key = key;
        this.value = value;
        this.description = description;
        this.category = category;
    }

    // Static factory methods for common settings
    public static SystemSetting maintenanceMode(boolean enabled) {
        SystemSetting setting = new SystemSetting();
        setting.setKey("MAINTENANCE_MODE");
        setting.setValue(String.valueOf(enabled));
        setting.setDescription("Enable read-only maintenance mode");
        setting.setCategory("SYSTEM");
        setting.setValueType("BOOLEAN");
        return setting;
    }

    public static SystemSetting systemAnnouncement(String message) {
        SystemSetting setting = new SystemSetting();
        setting.setKey("SYSTEM_ANNOUNCEMENT");
        setting.setValue(message);
        setting.setDescription("System-wide announcement message");
        setting.setCategory("SYSTEM");
        setting.setValueType("STRING");
        return setting;
    }

    public static SystemSetting registrationEnabled(boolean enabled) {
        SystemSetting setting = new SystemSetting();
        setting.setKey("REGISTRATION_ENABLED");
        setting.setValue(String.valueOf(enabled));
        setting.setDescription("Allow new user registrations");
        setting.setCategory("AUTH");
        setting.setValueType("BOOLEAN");
        return setting;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getValueType() { return valueType; }
    public void setValueType(String valueType) { this.valueType = valueType; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public UUID getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(UUID updatedBy) { this.updatedBy = updatedBy; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public boolean getBooleanValue() {
        return "true".equalsIgnoreCase(value);
    }

    public int getIntValue() {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
