namespace KidCode.Api.Models;

public class MediaAsset
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
    public byte[] Content { get; set; } = [];
    public string Title { get; set; } = string.Empty;
    public string? Source { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
    public double? Duration { get; set; }
    public string? ScriptJson { get; set; }
    public Guid? AlbumId { get; set; }
    public Guid? ProjectId { get; set; }
    public string? UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Album? Album { get; set; }
    public Project? Project { get; set; }
}
