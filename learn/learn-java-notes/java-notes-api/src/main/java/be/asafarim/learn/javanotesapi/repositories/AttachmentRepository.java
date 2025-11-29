package be.asafarim.learn.javanotesapi.repositories;

import be.asafarim.learn.javanotesapi.dto.AttachmentMetadataDto;
import be.asafarim.learn.javanotesapi.entities.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {

    /**
     * Find all attachments for a note (owner access)
     */
    List<Attachment> findAllByNoteId(UUID noteId);

    /**
     * Find only public attachments for a note (public access)
     */
    List<Attachment> findByNoteIdAndIsPublicTrue(UUID noteId);

    /**
     * Get attachment metadata without loading data blob (performance optimization)
     */
    @Query("SELECT new be.asafarim.learn.javanotesapi.dto.AttachmentMetadataDto(" +
           "a.id, a.filename, a.contentType, a.size, a.isPublic, a.uploadedAt) " +
           "FROM Attachment a WHERE a.note.id = :noteId ORDER BY a.uploadedAt DESC")
    List<AttachmentMetadataDto> findMetadataByNoteId(@Param("noteId") UUID noteId);

    /**
     * Get public attachment metadata without loading data blob
     */
    @Query("SELECT new be.asafarim.learn.javanotesapi.dto.AttachmentMetadataDto(" +
           "a.id, a.filename, a.contentType, a.size, a.isPublic, a.uploadedAt) " +
           "FROM Attachment a WHERE a.note.id = :noteId AND a.isPublic = true ORDER BY a.uploadedAt DESC")
    List<AttachmentMetadataDto> findPublicMetadataByNoteId(@Param("noteId") UUID noteId);

    /**
     * Make all attachments of a note private (used when note becomes private)
     */
    @Modifying
    @Query("UPDATE Attachment a SET a.isPublic = false WHERE a.note.id = :noteId")
    void makeAllPrivateByNoteId(@Param("noteId") UUID noteId);

    /**
     * Count attachments for a note
     */
    long countByNoteId(UUID noteId);
}
