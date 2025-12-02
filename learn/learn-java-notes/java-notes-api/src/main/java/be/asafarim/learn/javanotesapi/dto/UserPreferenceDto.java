package be.asafarim.learn.javanotesapi.dto;

import java.time.LocalDateTime;

public class UserPreferenceDto {

    private int notesPerPage;
    private String theme;
    private String language;
    private LocalDateTime updatedAt;

    // Constructors
    public UserPreferenceDto() {}

    public UserPreferenceDto(int notesPerPage, String theme, String language, LocalDateTime updatedAt) {
        this.notesPerPage = notesPerPage;
        this.theme = theme;
        this.language = language;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public int getNotesPerPage() { return notesPerPage; }
    public void setNotesPerPage(int notesPerPage) { this.notesPerPage = notesPerPage; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Request DTO for updates
    public static class UpdateRequest {
        private Integer notesPerPage;
        private String theme;
        private String language;

        public Integer getNotesPerPage() { return notesPerPage; }
        public void setNotesPerPage(Integer notesPerPage) { this.notesPerPage = notesPerPage; }

        public String getTheme() { return theme; }
        public void setTheme(String theme) { this.theme = theme; }

        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
    }
}
