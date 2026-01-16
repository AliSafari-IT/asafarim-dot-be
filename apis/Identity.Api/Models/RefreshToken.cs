using Identity.Api.Models.Common;

namespace Identity.Api.Models;

/// <summary>
/// Represents a refresh token for maintaining user sessions
/// </summary>
public class RefreshToken : BaseEntity 
{
    public Guid UserId { get; set; }
    public string Token { get; set; } = default!;
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? ReplacedByToken { get; set; }
    public string? RevokedByIp { get; set; }
    public string CreatedByIp { get; set; } = default!;

    // Navigation property
    public AppUser User { get; set; } = default!;

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsActive => !IsRevoked && !IsExpired;
}
