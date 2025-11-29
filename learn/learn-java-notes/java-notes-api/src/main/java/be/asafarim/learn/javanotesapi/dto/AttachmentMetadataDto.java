package be.asafarim.learn.javanotesapi.dto;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;

import java.time.Instant;
import java.util.UUID;

public class AttachmentMetadataDto {
    private UUID id;
    private String filename;
    private String contentType;
    private long size;
    @JsonProperty("isPublic")
    private boolean isPublic;
    private Instant uploadedAt;

    public AttachmentMetadataDto() {}

    public AttachmentMetadataDto(UUID id, String filename, String contentType, long size, boolean isPublic, Instant uploadedAt) {
        this.id = id;
        this.filename = filename;
        this.contentType = contentType;
        this.size = size;
        this.isPublic = isPublic;
        this.uploadedAt = uploadedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    @JsonGetter("isPublic")
    public boolean isPublic() {
        return isPublic;
    }

    @JsonSetter("isPublic")
    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Instant uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
