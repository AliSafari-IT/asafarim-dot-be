package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.dto.MessageResponse;
import be.asafarim.learn.javanotesapi.dto.citation.*;
import be.asafarim.learn.javanotesapi.enums.CitationStyle;
import be.asafarim.learn.javanotesapi.services.CitationFormattingService;
import be.asafarim.learn.javanotesapi.services.NoteCitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for managing note-to-note citations (knowledge graph).
 */
@RestController
@RequestMapping("/api/citations")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CitationController {

    @Autowired
    private NoteCitationService citationService;

    @Autowired
    private CitationFormattingService formattingService;

    // ==================== Create/Update/Delete Citations ====================

    /**
     * Create a citation from one note to another
     */
    @PostMapping("/notes/{noteId}/cite/{referencedNoteId}")
    public ResponseEntity<?> createCitation(
            @PathVariable UUID noteId,
            @PathVariable UUID referencedNoteId,
            @RequestBody(required = false) CreateCitationRequest request) {
        try {
            if (request == null) {
                request = new CreateCitationRequest();
            }
            NoteCitationDto citation = citationService.createCitation(noteId, referencedNoteId, request);
            return ResponseEntity.ok(citation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Update citation metadata
     */
    @PutMapping("/{citationId}")
    public ResponseEntity<?> updateCitation(
            @PathVariable UUID citationId,
            @RequestBody UpdateCitationRequest request) {
        try {
            NoteCitationDto citation = citationService.updateCitation(citationId, request);
            return ResponseEntity.ok(citation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Delete a citation by ID
     */
    @DeleteMapping("/{citationId}")
    public ResponseEntity<?> deleteCitation(@PathVariable UUID citationId) {
        try {
            citationService.deleteCitation(citationId);
            return ResponseEntity.ok(new MessageResponse("Citation deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Delete a citation by note and referenced note IDs
     */
    @DeleteMapping("/notes/{noteId}/cite/{referencedNoteId}")
    public ResponseEntity<?> deleteCitationByNotes(
            @PathVariable UUID noteId,
            @PathVariable UUID referencedNoteId) {
        try {
            citationService.deleteCitationByNotes(noteId, referencedNoteId);
            return ResponseEntity.ok(new MessageResponse("Citation deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // ==================== Query Citations ====================

    /**
     * Get all outgoing citations from a note (notes this note cites)
     */
    @GetMapping("/notes/{noteId}/outgoing")
    public ResponseEntity<?> getOutgoingCitations(@PathVariable UUID noteId) {
        try {
            List<NoteCitationDto> citations = citationService.getOutgoingCitations(noteId);
            return ResponseEntity.ok(citations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get all incoming citations to a note (notes that cite this note)
     */
    @GetMapping("/notes/{noteId}/incoming")
    public ResponseEntity<?> getIncomingCitations(@PathVariable UUID noteId) {
        try {
            List<NoteCitationDto> citations = citationService.getIncomingCitations(noteId);
            return ResponseEntity.ok(citations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get cited notes (notes referenced by a note) with summary info
     */
    @GetMapping("/notes/{noteId}/cited")
    public ResponseEntity<?> getCitedNotes(@PathVariable UUID noteId) {
        try {
            List<CitedNoteDto> citedNotes = citationService.getCitedNotes(noteId);
            return ResponseEntity.ok(citedNotes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get citing notes (notes that reference this note) with summary info
     */
    @GetMapping("/notes/{noteId}/citing")
    public ResponseEntity<?> getCitingNotes(@PathVariable UUID noteId) {
        try {
            List<CitingNoteDto> citingNotes = citationService.getCitingNotes(noteId);
            return ResponseEntity.ok(citingNotes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get citation statistics for a note
     */
    @GetMapping("/notes/{noteId}/stats")
    public ResponseEntity<?> getCitationStats(@PathVariable UUID noteId) {
        try {
            CitationStatsDto stats = citationService.getCitationStats(noteId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // ==================== Reorder Citations ====================

    /**
     * Reorder citations for a note
     */
    @PutMapping("/notes/{noteId}/reorder")
    public ResponseEntity<?> reorderCitations(
            @PathVariable UUID noteId,
            @RequestBody List<UUID> citationIds) {
        try {
            citationService.reorderCitations(noteId, citationIds);
            return ResponseEntity.ok(new MessageResponse("Citations reordered"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // ==================== Citation Rendering ====================

    /**
     * Render citations for a note with inline labels and references
     */
    @GetMapping("/notes/{noteId}/render")
    public ResponseEntity<?> renderCitations(
            @PathVariable UUID noteId,
            @RequestParam(defaultValue = "APA") String style) {
        try {
            CitationStyle citStyle = CitationStyle.valueOf(style.toUpperCase());
            CitationRenderResult result = formattingService.renderCitations(noteId, citStyle);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid citation style: " + style));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
