package be.asafarim.learn.javanotesapi.dto.citation;

/**
 * Request DTO for updating citation metadata.
 */
public class UpdateCitationRequest {
    private String pageReference;
    private String inlineMarker;
    private String context;
    private Integer firstPosition;
    private Integer citationCount;

    // Getters and Setters
    public String getPageReference() { return pageReference; }
    public void setPageReference(String pageReference) { this.pageReference = pageReference; }

    public String getInlineMarker() { return inlineMarker; }
    public void setInlineMarker(String inlineMarker) { this.inlineMarker = inlineMarker; }

    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }

    public Integer getFirstPosition() { return firstPosition; }
    public void setFirstPosition(Integer firstPosition) { this.firstPosition = firstPosition; }

    public Integer getCitationCount() { return citationCount; }
    public void setCitationCount(Integer citationCount) { this.citationCount = citationCount; }
}
