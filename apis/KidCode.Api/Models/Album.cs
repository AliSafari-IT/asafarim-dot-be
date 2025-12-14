namespace KidCode.Api.Models;

public class Album
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid? CoverMediaId { get; set; }
    public string? UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<MediaAsset> MediaAssets { get; set; } = new List<MediaAsset>();
}
