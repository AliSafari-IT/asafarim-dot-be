package be.asafarim.learn.javanotesapi.dto.admin;

import java.time.LocalDateTime;
import java.util.UUID;

public class SystemSettingDto {

    private UUID id;
    private String key;
    private String value;
    private String description;
    private String category;
    private String valueType;
    private LocalDateTime updatedAt;

    // Constructors
    public SystemSettingDto() {}

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

    // Request DTO
    public static class UpdateSettingRequest {
        private String value;

        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
    }

    public static class MaintenanceModeRequest {
        private boolean enabled;
        private String announcement;

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }

        public String getAnnouncement() { return announcement; }
        public void setAnnouncement(String announcement) { this.announcement = announcement; }
    }
}
