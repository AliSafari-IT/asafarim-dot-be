package be.asafarim.learn.javanotesapi.dto;

import java.util.UUID;

public class TagDeleteRequest {
    private UUID tagId;
    private boolean force;

    public TagDeleteRequest() {}

    public TagDeleteRequest(UUID tagId, boolean force) {
        this.tagId = tagId;
        this.force = force;
    }

    public UUID getTagId() {
        return tagId;
    }

    public void setTagId(UUID tagId) {
        this.tagId = tagId;
    }

    public boolean isForce() {
        return force;
    }

    public void setForce(boolean force) {
        this.force = force;
    }
}
