package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.NoteAnalytics;
import be.asafarim.learn.javanotesapi.dto.SearchResultDto;
import be.asafarim.learn.javanotesapi.entities.StudyNote;
import be.asafarim.learn.javanotesapi.entities.User;
import be.asafarim.learn.javanotesapi.repositories.StudyNoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchService {
    private final StudyNoteRepository noteRepository;
    private final NoteViewService noteViewService;

    public SearchService(StudyNoteRepository noteRepository, NoteViewService noteViewService) {
        this.noteRepository = noteRepository;
        this.noteViewService = noteViewService;
    }

    @Transactional(readOnly = true)
    public List<SearchResultDto> searchUserNotes(String query, String tag, User user) {
        List<StudyNote> notes;
        boolean hasQuery = query != null && !query.isBlank();
        boolean hasTag = tag != null && !tag.isBlank();
        
        if (!hasQuery) {
            notes = hasTag ? noteRepository.findByTagNameForUser(tag, user) 
                          : noteRepository.findByUserOrderByCreatedAtDesc(user);
            return notes.stream().map(n -> toResult(n, null)).collect(Collectors.toList());
        }
        
        notes = hasTag ? noteRepository.fullTextSearchByTagForUser(query.trim(), tag, user.getId())
                       : noteRepository.fullTextSearchForUser(query.trim(), user.getId());
        return notes.stream().map(n -> toResult(n, query)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SearchResultDto> searchPublicNotes(String query, String tag) {
        List<StudyNote> notes;
        boolean hasQuery = query != null && !query.isBlank();
        boolean hasTag = tag != null && !tag.isBlank();
        
        if (!hasQuery) {
            notes = hasTag ? noteRepository.findPublicByTagName(tag) : noteRepository.findAllPublicNotes();
            return notes.stream().map(n -> toResult(n, null)).collect(Collectors.toList());
        }
        
        notes = hasTag ? noteRepository.fullTextSearchPublicByTag(query.trim(), tag)
                       : noteRepository.fullTextSearchPublic(query.trim());
        return notes.stream().map(n -> toResult(n, query)).collect(Collectors.toList());
    }

    private SearchResultDto toResult(StudyNote note, String query) {
        NoteAnalytics analytics = noteViewService.getSafeAnalytics(note.getId());
        List<String> tags = note.getTags().stream().map(t -> t.getName()).sorted().toList();
        String hlTitle = null, hlContent = null;
        
        if (query != null) {
            try {
                hlTitle = noteRepository.getSearchHeadline(note.getTitle(), query);
                hlContent = noteRepository.getSearchHeadline(note.getContent(), query);
            } catch (Exception ignored) {}
        }
        
        return new SearchResultDto(note.getId(), note.getTitle(), note.getContent(),
            hlTitle, hlContent, tags, note.isPublic(), note.getReadingTimeMinutes(),
            note.getWordCount(), note.getCreatedAt(), note.getUpdatedAt(), 0.0, analytics);
    }
}
