package be.asafarim.learn.javanotesapi.dto;

import be.asafarim.learn.javanotesapi.enums.NoteVisibility;

public class VisibilityResponse {
    private NoteVisibility visibility;
    private String slug;
    private String publicId;
    private String publicUrl;
    private String shareUrl;

    public VisibilityResponse() {}

    public VisibilityResponse(NoteVisibility visibility, String slug, String publicId, String publicUrl, String shareUrl) {
        this.visibility = visibility;
        this.slug = slug;
        this.publicId = publicId;
        this.publicUrl = publicUrl;
        this.shareUrl = shareUrl;
    }

    public NoteVisibility getVisibility() {
        return visibility;
    }

    public void setVisibility(NoteVisibility visibility) {
        this.visibility = visibility;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getPublicId() {
        return publicId;
    }

    public void setPublicId(String publicId) {
        this.publicId = publicId;
    }

    public String getPublicUrl() {
        return publicUrl;
    }

    public void setPublicUrl(String publicUrl) {
        this.publicUrl = publicUrl;
    }

    public String getShareUrl() {
        return shareUrl;
    }

    public void setShareUrl(String shareUrl) {
        this.shareUrl = shareUrl;
    }
}
