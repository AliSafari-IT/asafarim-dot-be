package be.asafarim.learn.javanotesapi.dto;

import be.asafarim.learn.javanotesapi.enums.CitationStyle;
import be.asafarim.learn.javanotesapi.enums.NoteType;
import java.util.ArrayList;
import java.util.List;

public class StudyNoteRequest {
    private String title;
    private String content;
    private boolean isPublic = false;
    private List<String> tags = new ArrayList<>();
    
    // Academic metadata fields
    private String authors;
    private Integer publicationYear;
    private NoteType noteType;
    private CitationStyle citationStyle;
    private String journalName;
    private String publisher;
    private String doi;
    private String url;
    private String citationKey;

    public StudyNoteRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public boolean isPublic() { return isPublic; }
    public boolean getIsPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags != null ? tags : new ArrayList<>(); }

    // Academic metadata getters/setters
    public String getAuthors() { return authors; }
    public void setAuthors(String authors) { this.authors = authors; }

    public Integer getPublicationYear() { return publicationYear; }
    public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }

    public NoteType getNoteType() { return noteType; }
    public void setNoteType(NoteType noteType) { this.noteType = noteType; }

    public CitationStyle getCitationStyle() { return citationStyle; }
    public void setCitationStyle(CitationStyle citationStyle) { this.citationStyle = citationStyle; }

    public String getJournalName() { return journalName; }
    public void setJournalName(String journalName) { this.journalName = journalName; }

    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }

    public String getDoi() { return doi; }
    public void setDoi(String doi) { this.doi = doi; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getCitationKey() { return citationKey; }
    public void setCitationKey(String citationKey) { this.citationKey = citationKey; }
}
