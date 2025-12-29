namespace SmartPath.Api.Entities;

public class User
{
    public int UserId { get; set; }
    public string IdentityUserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string PreferredLanguage { get; set; } = "en";
    public DateTime LastSyncedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<FamilyMember> FamilyMemberships { get; set; } = new List<FamilyMember>();
}
