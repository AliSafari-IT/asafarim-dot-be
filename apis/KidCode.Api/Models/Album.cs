namespace KidCode.Api.Models;

public enum AlbumVisibility
{
    Private = 0,
    Public = 1,
    MembersOnly = 2
}

public class Album
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? CoverMediaId { get; set; }
    public string? UserId { get; set; }
    public AlbumVisibility Visibility { get; set; } = AlbumVisibility.Private;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<MediaAsset> MediaAssets { get; set; } = new List<MediaAsset>();
}
