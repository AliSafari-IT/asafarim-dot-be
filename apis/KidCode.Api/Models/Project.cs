namespace KidCode.Api.Models;

public class Project
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public ProjectMode Mode { get; set; }
    public string BlocksJson { get; set; } = "[]";
    public string? ModeDataJson { get; set; }
    public string? Assets { get; set; }
    public bool IsDraft { get; set; } = false;
    public string? UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastAutoSaveAt { get; set; }

    public ICollection<MediaAsset> MediaAssets { get; set; } = new List<MediaAsset>();
}

public enum ProjectMode
{
    Drawing,
    Story,
    Puzzle,
    Music,
}
