package be.asafarim.learn.javanotesapi.dto;

import java.time.Instant;
import java.util.UUID;

public class TagUsageDto {
    private UUID id;
    private String name;
    private long usageCount;
    private Instant createdAt;

    public TagUsageDto() {}

    public TagUsageDto(UUID id, String name, long usageCount, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.usageCount = usageCount;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getUsageCount() {
        return usageCount;
    }

    public void setUsageCount(long usageCount) {
        this.usageCount = usageCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
