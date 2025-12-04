package be.asafarim.learn.javanotesapi.dto;

import be.asafarim.learn.javanotesapi.enums.NoteVisibility;

public class VisibilityUpdateRequest {
    private NoteVisibility visibility;

    public VisibilityUpdateRequest() {}

    public VisibilityUpdateRequest(NoteVisibility visibility) {
        this.visibility = visibility;
    }

    public NoteVisibility getVisibility() {
        return visibility;
    }

    public void setVisibility(NoteVisibility visibility) {
        this.visibility = visibility;
    }
}
