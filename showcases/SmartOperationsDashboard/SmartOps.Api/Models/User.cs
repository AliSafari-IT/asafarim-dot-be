namespace SmartOps.Api.Models;

/// <summary>
/// UserPermission entity - maps Identity.Api AppUser to SmartOps roles
/// Stores only role/permission data; user identity comes from JWT claims
/// </summary>
public class UserPermission
{
    public Guid Id { get; set; }

    /// <summary>
    /// UserId from Identity.Api AppUser (from JWT "sub" claim)
    /// </summary>
    public Guid AppUserId { get; set; }

    /// <summary>
    /// User's role in SmartOps (Member, Manager, Admin)
    /// </summary>
    public UserRole Role { get; set; } = UserRole.Member;

    /// <summary>
    /// Whether user can access SmartOps
    /// </summary>
    public bool IsActive { get; set; } = true;

    // Metadata
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
