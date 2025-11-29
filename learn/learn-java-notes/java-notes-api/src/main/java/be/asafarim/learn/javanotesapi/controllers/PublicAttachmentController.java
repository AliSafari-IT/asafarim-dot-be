package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.dto.AttachmentDownloadDto;
import be.asafarim.learn.javanotesapi.dto.AttachmentMetadataDto;
import be.asafarim.learn.javanotesapi.services.AttachmentService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicAttachmentController {

    private final AttachmentService attachmentService;

    public PublicAttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    /**
     * List public attachments for a public note (no auth required)
     */
    @GetMapping("/notes/{noteId}/attachments")
    public ResponseEntity<List<AttachmentMetadataDto>> listPublicAttachments(@PathVariable UUID noteId) {
        try {
            List<AttachmentMetadataDto> attachments = attachmentService.listPublicAttachments(noteId);
            return ResponseEntity.ok(attachments);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Download a public attachment (no auth required, only works for public attachments of public notes)
     */
    @GetMapping("/attachments/{id}/download")
    public ResponseEntity<byte[]> downloadPublicAttachment(@PathVariable UUID id) {
        try {
            AttachmentDownloadDto download = attachmentService.getAttachmentForDownload(id, true);
            
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
}
