package be.asafarim.learn.javanotesapi.dto;

import java.util.UUID;

public class TagRenameRequest {
    private UUID tagId;
    private String newName;

    public TagRenameRequest() {}

    public TagRenameRequest(UUID tagId, String newName) {
        this.tagId = tagId;
        this.newName = newName;
    }

    public UUID getTagId() {
        return tagId;
    }

    public void setTagId(UUID tagId) {
        this.tagId = tagId;
    }

    public String getNewName() {
        return newName;
    }

    public void setNewName(String newName) {
        this.newName = newName;
    }
}
