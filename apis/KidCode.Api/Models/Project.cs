namespace KidCode.Api.Models;

public class Project
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public ProjectMode Mode { get; set; }
    public string BlocksJson { get; set; } = "[]";
    public string? Assets { get; set; }
    public string? UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum ProjectMode
{
    Drawing,
    Story,
    Puzzle,
    Music,
}
