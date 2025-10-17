namespace Core.Api.DTOs.Portfolio;

/// <summary>
/// DTO for linking resumes to a project or publication
/// </summary>
public class LinkResumesDto
{
    public List<Guid> ResumeIds { get; set; } = new();
    
    /// <summary>
    /// Optional: Link to specific work experiences within resumes
    /// Key: ResumeId, Value: WorkExperienceId
    /// </summary>
    public Dictionary<Guid, Guid>? WorkExperienceLinks { get; set; }
    
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for bulk linking operations
/// </summary>
public class BulkLinkResumesDto
{
    public List<Guid> ProjectIds { get; set; } = new();
    public List<Guid> ResumeIds { get; set; } = new();
    public string? Notes { get; set; }
}

/// <summary>
/// Response DTO for resume linking
/// </summary>
public class ResumeLinkDto
{
    public Guid Id { get; set; }
    public Guid ResumeId { get; set; }
    public string ResumeTitle { get; set; } = string.Empty;
    public Guid? WorkExperienceId { get; set; }
    public string? WorkExperienceTitle { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Notes { get; set; }
}
