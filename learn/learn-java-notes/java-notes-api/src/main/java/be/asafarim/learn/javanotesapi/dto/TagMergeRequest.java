package be.asafarim.learn.javanotesapi.dto;

import java.util.List;
import java.util.UUID;

public class TagMergeRequest {
    private List<UUID> sourceTagIds;
    private String targetName;

    public TagMergeRequest() {}

    public TagMergeRequest(List<UUID> sourceTagIds, String targetName) {
        this.sourceTagIds = sourceTagIds;
        this.targetName = targetName;
    }

    public List<UUID> getSourceTagIds() {
        return sourceTagIds;
    }

    public void setSourceTagIds(List<UUID> sourceTagIds) {
        this.sourceTagIds = sourceTagIds;
    }

    public String getTargetName() {
        return targetName;
    }

    public void setTargetName(String targetName) {
        this.targetName = targetName;
    }
}
