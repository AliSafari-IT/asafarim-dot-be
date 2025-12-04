package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.dto.*;
import be.asafarim.learn.javanotesapi.services.TagManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags/manage")
@CrossOrigin(origins = "*")
public class TagManagementController {

    private final TagManagementService service;

    public TagManagementController(TagManagementService service) {
        this.service = service;
    }

    /**
     * Get all tags with usage statistics
     */
    @GetMapping("/usage")
    public ResponseEntity<List<TagUsageDto>> getTagUsage() {
        try {
            List<TagUsageDto> usage = service.getAllTagUsage();
            return ResponseEntity.ok(usage);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Rename a tag
     */
    @PostMapping("/rename")
    public ResponseEntity<?> renameTag(@RequestBody TagRenameRequest request) {
        try {
            TagUsageDto result = service.renameTag(request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Merge multiple tags into one
     */
    @PostMapping("/merge")
    public ResponseEntity<?> mergeTags(@RequestBody TagMergeRequest request) {
        try {
            TagUsageDto result = service.mergeTags(request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Delete a tag
     */
    @PostMapping("/delete")
    public ResponseEntity<?> deleteTag(@RequestBody TagDeleteRequest request) {
        try {
            service.deleteTag(request);
            return ResponseEntity.ok(new MessageResponse("Tag deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
