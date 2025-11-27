package be.asafarim.learn.javanotesapi.dto;

import java.util.ArrayList;
import java.util.List;

public class StudyNoteRequest {
    private String title;
    private String content;
    private List<String> tags = new ArrayList<>();

    public StudyNoteRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags != null ? tags : new ArrayList<>(); }
}
