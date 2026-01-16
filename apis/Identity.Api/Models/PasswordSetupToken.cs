using Identity.Api.Models.Common;

namespace Identity.Api.Models;

/// <summary>
/// Represents a one-time magic link token for password setup
/// Used when admin creates a user with null password
/// </summary>
public class PasswordSetupToken : BaseEntity
{
    public Guid UserId { get; set; }
    public string Token { get; set; } = default!;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public DateTime? UsedAt { get; set; }

    // Navigation property
    public AppUser User { get; set; } = default!;

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsValid => !IsUsed && !IsExpired;
}
