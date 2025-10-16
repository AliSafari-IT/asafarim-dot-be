namespace Core.Api.Models.Resume;

public class ProjectImage
{
    public Guid Id { get; set; }
    
    public Guid ProjectId { get; set; }
    
    public string ImageUrl { get; set; } = string.Empty;
    
    public string? Caption { get; set; }
    
    public int DisplayOrder { get; set; }
    
    public bool IsPrimary { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public virtual Project? Project { get; set; }
}
