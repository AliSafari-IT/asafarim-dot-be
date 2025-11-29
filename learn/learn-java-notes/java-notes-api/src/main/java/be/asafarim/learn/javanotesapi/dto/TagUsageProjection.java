package be.asafarim.learn.javanotesapi.dto;

import java.util.UUID;

public interface TagUsageProjection {
    UUID getId();
    String getName();
    long getUsageCount();
}
