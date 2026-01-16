namespace Identity.Api.Models.Common;

/// <summary>
/// Comprehensive base entity class for all domain models.
/// Provides ID management and audit trail functionality.
/// </summary>
public abstract class BaseEntity
{
    /// <summary>
    /// Unique identifier for the entity.
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Timestamp when the entity was created (UTC).
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp when the entity was last updated (UTC).
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Optional: User ID of who created the entity.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Optional: User ID of who last updated the entity.
    /// </summary>
    public string? UpdatedBy { get; set; }

    /// <summary>
    /// Soft delete flag. Set to true when entity is logically deleted.
    /// </summary>
    public bool IsDeleted { get; set; } = false;

    /// <summary>
    /// Optional: Timestamp when the entity was deleted (UTC).
    /// </summary>
    public DateTime? DeletedAt { get; set; }

    /// <summary>
    /// Optional: User ID of who deleted the entity.
    /// </summary>
    public string? DeletedBy { get; set; }
}
