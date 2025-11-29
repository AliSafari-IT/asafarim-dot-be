package be.asafarim.learn.javanotesapi.dto;

public class SlugUpdateRequest {
    private String slug;

    public SlugUpdateRequest() {}

    public SlugUpdateRequest(String slug) {
        this.slug = slug;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }
}
