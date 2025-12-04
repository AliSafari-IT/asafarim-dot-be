package be.asafarim.learn.javanotesapi.dto.admin;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class PermissionDto {

    private UUID id;
    private String name;
    private String description;
    private String category;
    private LocalDateTime createdAt;
    private long roleCount;
    private List<String> usedByRoles;

    // Constructors
    public PermissionDto() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public long getRoleCount() { return roleCount; }
    public void setRoleCount(long roleCount) { this.roleCount = roleCount; }

    public List<String> getUsedByRoles() { return usedByRoles; }
    public void setUsedByRoles(List<String> usedByRoles) { this.usedByRoles = usedByRoles; }

    // Request DTO
    public static class CreatePermissionRequest {
        private String name;
        private String description;
        private String category;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }
}
