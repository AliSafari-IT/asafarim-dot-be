package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.DashboardAnalytics;
import be.asafarim.learn.javanotesapi.dto.DashboardAnalytics.NoteViewSummary;
import be.asafarim.learn.javanotesapi.dto.DashboardAnalytics.TagCount;
import be.asafarim.learn.javanotesapi.entities.StudyNote;
import be.asafarim.learn.javanotesapi.entities.Tag;
import be.asafarim.learn.javanotesapi.entities.User;
import be.asafarim.learn.javanotesapi.repositories.NoteViewRepository;
import be.asafarim.learn.javanotesapi.repositories.StudyNoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final StudyNoteRepository noteRepository;
    private final NoteViewRepository viewRepository;
    private final AuthService authService;

    public AnalyticsService(StudyNoteRepository noteRepository, NoteViewRepository viewRepository, AuthService authService) {
        this.noteRepository = noteRepository;
        this.viewRepository = viewRepository;
        this.authService = authService;
    }

    public DashboardAnalytics getDashboardAnalytics() {
        User user = authService.getCurrentUser();
        UUID userId = user.getId();
        DashboardAnalytics a = new DashboardAnalytics();
        
        a.setTotalNotes(noteRepository.countByUser(user));
        a.setPublicNotes(noteRepository.countPublicNotesByUser(user));
        a.setPrivateNotes(noteRepository.countPrivateNotesByUser(user));
        a.setTotalWords(noteRepository.sumWordCountByUser(user));
        a.setTotalReadingTimeMinutes(noteRepository.sumReadingTimeByUser(user));
        
        try {
            a.setTotalViews(viewRepository.countTotalViewsForUser(userId));
            a.setTotalPublicViews(viewRepository.countPublicViewsForUser(userId));
            a.setTotalPrivateViews(viewRepository.countPrivateViewsForUser(userId));
            a.setViewsLast7Days(viewRepository.countViewsForUserSince(userId, LocalDateTime.now().minusDays(7)));
            a.setViewsLast30Days(viewRepository.countViewsForUserSince(userId, LocalDateTime.now().minusDays(30)));
        } catch (Exception e) {
            a.setTotalViews(0); a.setTotalPublicViews(0); a.setTotalPrivateViews(0);
            a.setViewsLast7Days(0); a.setViewsLast30Days(0);
        }
        
        a.setTagDistribution(getTagDistribution(user));
        a.setMostViewedNotes(getMostViewedNotes(userId));
        a.setViewsPerDay(getViewsPerDay(userId));
        a.setNotesCreatedPerDay(getNotesCreatedPerDay(user));
        
        return a;
    }

    private List<TagCount> getTagDistribution(User user) {
        Map<String, Long> counts = new HashMap<>();
        for (StudyNote n : noteRepository.findByUserOrderByCreatedAtDesc(user)) {
            for (Tag t : n.getTags()) counts.merge(t.getName(), 1L, Long::sum);
        }
        return counts.entrySet().stream()
            .map(e -> new TagCount(e.getKey(), e.getValue()))
            .sorted((x, y) -> Long.compare(y.getCount(), x.getCount()))
            .limit(15).collect(Collectors.toList());
    }

    private List<NoteViewSummary> getMostViewedNotes(UUID userId) {
        try {
            List<NoteViewSummary> list = new ArrayList<>();
            for (Object[] r : viewRepository.findMostViewedNotesForUser(userId)) {
                if (list.size() >= 10) break;
                noteRepository.findById((UUID) r[0]).ifPresent(n -> 
                    list.add(new NoteViewSummary(n.getId().toString(), n.getTitle(), (Long) r[1], n.isPublic())));
            }
            return list;
        } catch (Exception e) { return Collections.emptyList(); }
    }

    private Map<String, Long> getViewsPerDay(UUID userId) {
        Map<String, Long> map = new LinkedHashMap<>();
        DateTimeFormatter f = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate today = LocalDate.now();
        for (int i = 29; i >= 0; i--) map.put(today.minusDays(i).format(f), 0L);
        try {
            for (Object[] r : viewRepository.getViewsPerDayForUser(userId, LocalDateTime.now().minusDays(30))) {
                if (r[0] != null) map.put(r[0].toString().substring(0, 10), (Long) r[1]);
            }
        } catch (Exception e) {}
        return map;
    }

    private Map<String, Long> getNotesCreatedPerDay(User user) {
        Map<String, Long> map = new LinkedHashMap<>();
        DateTimeFormatter f = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate today = LocalDate.now();
        for (int i = 29; i >= 0; i--) map.put(today.minusDays(i).format(f), 0L);
        for (StudyNote n : noteRepository.findByUserAndCreatedAtAfter(user, LocalDateTime.now().minusDays(30))) {
            String d = n.getCreatedAt().toLocalDate().format(f);
            map.merge(d, 1L, Long::sum);
        }
        return map;
    }
}
