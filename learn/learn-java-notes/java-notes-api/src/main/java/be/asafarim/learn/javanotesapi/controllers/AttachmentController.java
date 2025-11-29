package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.dto.AttachmentDownloadDto;
import be.asafarim.learn.javanotesapi.dto.AttachmentMetadataDto;
import be.asafarim.learn.javanotesapi.dto.MessageResponse;
import be.asafarim.learn.javanotesapi.services.AttachmentService;
import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    /**
     * Upload an attachment to a note (owner only)
     */
    @PostMapping("/notes/{noteId}/attachments")
    public ResponseEntity<?> uploadAttachment(
            @PathVariable UUID noteId,
            @RequestPart("file") MultipartFile file,
            @RequestParam(name = "public", defaultValue = "false") boolean isPublic) {
        try {
            AttachmentMetadataDto metadata = attachmentService.uploadAttachment(noteId, file, isPublic);
            return ResponseEntity.ok(metadata);
        } catch (RuntimeException e) {
            System.err.println("Attachment upload error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * List all attachments for a note (owner only)
     */
    @GetMapping("/notes/{noteId}/attachments")
    public ResponseEntity<List<AttachmentMetadataDto>> listAttachments(@PathVariable UUID noteId) {
        try {
            List<AttachmentMetadataDto> attachments = attachmentService.listAttachments(noteId);
            return ResponseEntity.ok(attachments);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Download an attachment (owner only, works for both public and private attachments)
     */
    @GetMapping("/attachments/{id}/download")
    public ResponseEntity<byte[]> downloadAttachment(@PathVariable UUID id) {
        try {
            AttachmentDownloadDto download = attachmentService.getAttachmentForDownload(id, false);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(download.getContentType()));
            headers.setContentDispositionFormData("attachment", download.getFilename());
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(download.getData());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update attachment visibility (owner only)
     */
    @PutMapping("/attachments/{id}")
    public ResponseEntity<?> updateAttachment(
            @PathVariable UUID id,
            @RequestBody AttachmentUpdateRequest request) {
        try {
            AttachmentMetadataDto metadata = attachmentService.updateAttachmentVisibility(id, request.isPublic());
            return ResponseEntity.ok(metadata);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Delete an attachment (owner only)
     */
    @DeleteMapping("/attachments/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable UUID id) {
        try {
            attachmentService.deleteAttachment(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DTO for updating attachment visibility
     */
    public static class AttachmentUpdateRequest {
        @JsonProperty("isPublic")
        private boolean isPublic;

        public AttachmentUpdateRequest() {}

        public AttachmentUpdateRequest(boolean isPublic) {
            this.isPublic = isPublic;
        }

        @JsonGetter("isPublic")
        public boolean isPublic() {
            return isPublic;
        }

        @JsonSetter("isPublic")
        public void setPublic(boolean isPublic) {
            this.isPublic = isPublic;
        }
    }
}
