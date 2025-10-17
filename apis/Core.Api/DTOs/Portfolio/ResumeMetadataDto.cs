namespace Core.Api.DTOs.Portfolio;

/// <summary>
/// Lightweight resume metadata for selection UI
/// </summary>
public class ResumeMetadataDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? ResumeType { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsPublic { get; set; }
    public int ProjectCount { get; set; }
    public List<WorkExperienceMetadataDto> WorkExperiences { get; set; } = new();
}

public class WorkExperienceMetadataDto
{
    public Guid Id { get; set; }
    public string Company { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrent { get; set; }
}
