package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.NoteAnalytics;
import be.asafarim.learn.javanotesapi.entities.NoteView;
import be.asafarim.learn.javanotesapi.entities.StudyNote;
import be.asafarim.learn.javanotesapi.entities.User;
import be.asafarim.learn.javanotesapi.repositories.NoteViewRepository;
import be.asafarim.learn.javanotesapi.repositories.StudyNoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for tracking note views and calculating analytics.
 */
@Service
@Transactional(readOnly = true)
public class NoteViewService {

    private final NoteViewRepository viewRepository;
    private final StudyNoteRepository noteRepository;
    private final AuthService authService;

    public NoteViewService(NoteViewRepository viewRepository, 
                          StudyNoteRepository noteRepository,
                          AuthService authService) {
        this.viewRepository = viewRepository;
        this.noteRepository = noteRepository;
        this.authService = authService;
    }

    /**
     * Track a view for a public note (anonymous access)
     */
    @Transactional
    public void trackPublicView(UUID noteId, String userAgent, String ipAddress) {
        Optional<StudyNote> noteOpt = noteRepository.findById(noteId);
        if (noteOpt.isEmpty() || !noteOpt.get().isPublic()) {
            return; // Don't track if note doesn't exist or isn't public
        }

        StudyNote note = noteOpt.get();
        
        // Deduplicate: Only count one view per IP per day for anonymous users
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        if (ipAddress != null && viewRepository.hasIpViewedSince(noteId, ipAddress, startOfDay)) {
            return; // Already viewed today from this IP
        }

        NoteView view = new NoteView(note, null, true, userAgent, ipAddress);
        viewRepository.save(view);
    }

    /**
     * Track a view for an authenticated user (private note access)
     */
    @Transactional
    public void trackAuthenticatedView(UUID noteId, String userAgent, String ipAddress) {
        Optional<StudyNote> noteOpt = noteRepository.findById(noteId);
        if (noteOpt.isEmpty()) {
            return;
        }

        StudyNote note = noteOpt.get();
        User currentUser = null;
        
        try {
            currentUser = authService.getCurrentUser();
        } catch (Exception e) {
            // User not authenticated, track as public view if note is public
            if (note.isPublic()) {
                trackPublicView(noteId, userAgent, ipAddress);
            }
            return;
        }

        // Check if user is the note owner (don't count owner's own views)
        if (note.getUser().getId().equals(currentUser.getId())) {
            return;
        }

        // Deduplicate: Only count one view per user per day
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        if (viewRepository.hasUserViewedSince(noteId, currentUser.getId(), startOfDay)) {
            return; // Already viewed today
        }

        NoteView view = new NoteView(note, currentUser, false, userAgent, ipAddress);
        viewRepository.save(view);
    }

    /**
     * Get analytics for a specific note (SAFE - never throws, returns empty on error)
     * Use this method in controllers/services to prevent analytics errors from breaking requests.
     * Uses REQUIRES_NEW to isolate transaction so failures don't affect parent transaction.
     */
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public NoteAnalytics getSafeAnalytics(UUID noteId) {
        try {
            return getAnalyticsInternal(noteId);
        } catch (Exception e) {
            System.err.println("Warning: Analytics query failed for note " + noteId + ": " + e.getMessage());
            return NoteAnalytics.empty();
        }
    }

    /**
     * Get analytics for a specific note (may throw on DB errors)
     */
    public NoteAnalytics getAnalytics(UUID noteId) {
        return getAnalyticsInternal(noteId);
    }

    /**
     * Internal analytics computation
     */
    private NoteAnalytics getAnalyticsInternal(UUID noteId) {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        long totalViews = viewRepository.countByNoteId(noteId);
        long publicViews = viewRepository.countPublicViewsByNoteId(noteId);
        long privateViews = viewRepository.countPrivateViewsByNoteId(noteId);
        long viewsLast7Days = viewRepository.countViewsSince(noteId, sevenDaysAgo);
        long viewsLast30Days = viewRepository.countViewsSince(noteId, thirtyDaysAgo);
        long uniqueViewers = viewRepository.countUniqueViewersByNoteId(noteId);

        return new NoteAnalytics(
            totalViews,
            publicViews,
            privateViews,
            viewsLast7Days,
            viewsLast30Days,
            uniqueViewers
        );
    }

    /**
     * Get analytics for a note, verifying the current user owns it
     */
    public NoteAnalytics getAnalyticsForOwner(UUID noteId) {
        User currentUser = authService.getCurrentUser();
        Optional<StudyNote> noteOpt = noteRepository.findById(noteId);
        
        if (noteOpt.isEmpty()) {
            throw new RuntimeException("Note not found");
        }
        
        StudyNote note = noteOpt.get();
        if (!note.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have permission to view analytics for this note");
        }

        return getAnalytics(noteId);
    }
}
