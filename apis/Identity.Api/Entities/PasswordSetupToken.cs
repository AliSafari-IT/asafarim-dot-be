namespace Identity.Api.Entities;

/// <summary>
/// Represents a one-time magic link token for password setup
/// Used when admin creates a user with null password
/// </summary>
public class PasswordSetupToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Token { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public DateTime? UsedAt { get; set; }

    // Navigation property
    public AppUser User { get; set; } = default!;

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsValid => !IsUsed && !IsExpired;
}
