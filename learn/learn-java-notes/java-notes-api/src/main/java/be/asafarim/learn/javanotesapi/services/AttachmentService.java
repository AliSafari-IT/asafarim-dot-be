package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.AttachmentDownloadDto;
import be.asafarim.learn.javanotesapi.dto.AttachmentMetadataDto;
import be.asafarim.learn.javanotesapi.entities.Attachment;
import be.asafarim.learn.javanotesapi.entities.StudyNote;
import be.asafarim.learn.javanotesapi.entities.User;
import be.asafarim.learn.javanotesapi.repositories.AttachmentRepository;
import be.asafarim.learn.javanotesapi.repositories.StudyNoteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class AttachmentService {
    private static final Logger logger = LoggerFactory.getLogger(AttachmentService.class);

    private final AttachmentRepository attachmentRepository;
    private final StudyNoteRepository noteRepository;
    private final AuthService authService;

    @Value("${app.attachments.storage-root:uploads}")
    private String storageRoot;

    @Value("${app.attachments.max-size-mb:10}")
    private long maxSizeMb;

    private static final long THRESHOLD_DB_BYTES = 1024 * 1024; // 1MB
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
        "pdf", "png", "jpg", "jpeg", "gif", "txt", "md", "zip", 
        "docx", "xlsx", "pptx"
    );

    public AttachmentService(AttachmentRepository attachmentRepository,
                           StudyNoteRepository noteRepository,
                           AuthService authService) {
        this.attachmentRepository = attachmentRepository;
        this.noteRepository = noteRepository;
        this.authService = authService;
    }

    @Transactional
    public AttachmentMetadataDto uploadAttachment(UUID noteId, MultipartFile file, boolean isPublicRequested) {
        User currentUser = authService.getCurrentUser();

        // Load note and verify ownership
        StudyNote note = noteRepository.findById(noteId)
            .filter(n -> n.getUser().getId().equals(currentUser.getId()))
            .orElseThrow(() -> new RuntimeException("Note not found or you don't have permission"));

        // Validate file
        validateFile(file);

        // Determine actual visibility: attachment can only be public if note is public AND user requests it
        boolean actualIsPublic = note.isPublic() && isPublicRequested;

        // Create attachment entity
        String contentType = file.getContentType();
        if (contentType == null || contentType.isEmpty()) {
            contentType = "application/octet-stream"; // Default binary type
        }
        
        Attachment attachment = new Attachment(
            note,
            file.getOriginalFilename(),
            contentType,
            file.getSize(),
            actualIsPublic
        );

        try {
            // Store on filesystem: first save to get the ID, then store file
            attachment.setData(null);
            attachment.setStoragePath("pending");
            attachment = attachmentRepository.save(attachment);
            
            String relativePath = storeOnFilesystem(noteId, attachment.getId(), file);
            attachment.setStoragePath(relativePath);
            attachmentRepository.save(attachment);

            return toMetadataDto(attachment);
        } catch (IOException e) {
            logger.error("Failed to store attachment for note {}", noteId, e);
            throw new RuntimeException("Failed to store attachment: " + e.getMessage(), e);
        }
    }

    public List<AttachmentMetadataDto> listAttachments(UUID noteId) {
        User currentUser = authService.getCurrentUser();

        // Verify ownership
        StudyNote note = noteRepository.findById(noteId)
            .filter(n -> n.getUser().getId().equals(currentUser.getId()))
            .orElseThrow(() -> new RuntimeException("Note not found or you don't have permission"));

        return attachmentRepository.findMetadataByNoteId(noteId);
    }

    public List<AttachmentMetadataDto> listPublicAttachments(UUID noteId) {
        // Verify note is public
        StudyNote note = noteRepository.findById(noteId)
            .filter(StudyNote::isPublic)
            .orElseThrow(() -> new RuntimeException("Public note not found"));

        return attachmentRepository.findPublicMetadataByNoteId(noteId);
    }

    public AttachmentDownloadDto getAttachmentForDownload(UUID attachmentId, boolean publicEndpoint) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new RuntimeException("Attachment not found"));

        if (publicEndpoint) {
            // Public endpoint: verify both note and attachment are public
            if (!attachment.getNote().isPublic() || !attachment.isPublic()) {
                throw new RuntimeException("Attachment not found or not public");
            }
        } else {
            // Private endpoint: verify ownership
            User currentUser = authService.getCurrentUser();
            if (!attachment.getNote().getUser().getId().equals(currentUser.getId())) {
                throw new RuntimeException("Attachment not found or you don't have permission");
            }
        }

        try {
            byte[] data;
            if (attachment.getData() != null) {
                // Stored in database
                data = attachment.getData();
            } else if (attachment.getStoragePath() != null) {
                // Stored on filesystem
                Path filePath = Paths.get(storageRoot, attachment.getStoragePath());
                data = Files.readAllBytes(filePath);
            } else {
                throw new RuntimeException("Attachment data not found");
            }

            return new AttachmentDownloadDto(data, attachment.getFilename(), attachment.getContentType());
        } catch (IOException e) {
            throw new RuntimeException("Failed to read attachment: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteAttachment(UUID attachmentId) {
        User currentUser = authService.getCurrentUser();

        Attachment attachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new RuntimeException("Attachment not found"));

        // Verify ownership
        if (!attachment.getNote().getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have permission to delete this attachment");
        }

        // Delete file from filesystem if stored there
        if (attachment.getStoragePath() != null) {
            try {
                Path filePath = Paths.get(storageRoot, attachment.getStoragePath());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                logger.warn("Failed to delete attachment file: {}", attachment.getStoragePath(), e);
            }
        }

        attachmentRepository.delete(attachment);
    }

    @Transactional
    public AttachmentMetadataDto updateAttachmentVisibility(UUID attachmentId, boolean isPublic) {
        User currentUser = authService.getCurrentUser();

        Attachment attachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new RuntimeException("Attachment not found"));

        // Verify ownership
        if (!attachment.getNote().getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have permission to update this attachment");
        }

        // Can only make public if note is public
        if (isPublic && !attachment.getNote().isPublic()) {
            throw new RuntimeException("Cannot make attachment public when note is private");
        }

        logger.info("Updating attachment {} visibility to isPublic={}", attachmentId, isPublic);
        logger.info("Before update: attachment.isPublic()={}", attachment.isPublic());
        attachment.setPublic(isPublic);
        logger.info("After setPublic: attachment.isPublic()={}", attachment.isPublic());
        Attachment saved = attachmentRepository.save(attachment);
        logger.info("After save: saved.isPublic()={}", saved.isPublic());
        AttachmentMetadataDto dto = toMetadataDto(saved);
        logger.info("DTO created with isPublic={}", saved.isPublic());
        return dto;
    }

    @Transactional
    public void makeAllPrivate(UUID noteId) {
        attachmentRepository.makeAllPrivateByNoteId(noteId);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty or null");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.isEmpty()) {
            throw new RuntimeException("Invalid filename");
        }

        // Check size
        long maxSizeBytes = maxSizeMb * 1024 * 1024;
        if (file.getSize() > maxSizeBytes) {
            throw new RuntimeException("File size exceeds maximum allowed size of " + maxSizeMb + "MB");
        }

        // Check extension
        String extension = getFileExtension(filename).toLowerCase();
        if (extension.isEmpty()) {
            throw new RuntimeException("File must have an extension");
        }
        
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new RuntimeException("File type '." + extension + "' not allowed. Allowed types: " + String.join(", ", ALLOWED_EXTENSIONS));
        }
    }

    private String storeOnFilesystem(UUID noteId, UUID attachmentId, MultipartFile file) throws IOException {
        // Create directory structure: uploads/{noteId}/
        Path noteDir = Paths.get(storageRoot, noteId.toString());
        Files.createDirectories(noteDir);

        // Store file with attachment ID as filename (preserving extension)
        String extension = getFileExtension(file.getOriginalFilename());
        String filename = attachmentId.toString() + (extension.isEmpty() ? "" : "." + extension);
        Path targetPath = noteDir.resolve(filename);

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // Return relative path
        return noteId.toString() + "/" + filename;
    }

    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot > 0 && lastDot < filename.length() - 1) {
            return filename.substring(lastDot + 1);
        }
        return "";
    }

    private AttachmentMetadataDto toMetadataDto(Attachment attachment) {
        return new AttachmentMetadataDto(
            attachment.getId(),
            attachment.getFilename(),
            attachment.getContentType(),
            attachment.getSize(),
            attachment.isPublic(),
            attachment.getUploadedAt()
        );
    }
}
