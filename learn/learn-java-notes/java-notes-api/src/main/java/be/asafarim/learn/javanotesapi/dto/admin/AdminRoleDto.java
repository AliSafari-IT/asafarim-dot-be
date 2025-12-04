package be.asafarim.learn.javanotesapi.dto.admin;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class AdminRoleDto {

    private UUID id;
    private String name;
    private String description;
    private String color;
    private boolean isSystem;
    private LocalDateTime createdAt;
    private List<String> permissions;
    private long userCount;

    // Constructors
    public AdminRoleDto() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public boolean isSystem() { return isSystem; }
    public void setSystem(boolean system) { isSystem = system; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<String> getPermissions() { return permissions; }
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }

    public long getUserCount() { return userCount; }
    public void setUserCount(long userCount) { this.userCount = userCount; }

    // Request DTOs as inner classes
    public static class CreateRoleRequest {
        private String name;
        private String description;
        private String color;
        private List<String> permissions;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }

        public List<String> getPermissions() { return permissions; }
        public void setPermissions(List<String> permissions) { this.permissions = permissions; }
    }

    public static class UpdateRoleRequest {
        private String name;
        private String description;
        private String color;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
    }

    public static class UpdatePermissionsRequest {
        private List<String> permissions;

        public List<String> getPermissions() { return permissions; }
        public void setPermissions(List<String> permissions) { this.permissions = permissions; }
    }
}
