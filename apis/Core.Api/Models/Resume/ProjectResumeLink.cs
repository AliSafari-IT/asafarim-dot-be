namespace Core.Api.Models.Resume;

/// <summary>
/// Many-to-many relationship: Project ↔ Resume
/// Tracks which resumes are linked to which projects
/// </summary>
public class ProjectResumeLink
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Guid ResumeId { get; set; }
    
    /// <summary>
    /// Optional: Link to specific work experience within the resume
    /// </summary>
    public Guid? WorkExperienceId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
    
    // Navigation properties
    public Project? Project { get; set; }
    public Resume? Resume { get; set; }
    public WorkExperience? WorkExperience { get; set; }
}
