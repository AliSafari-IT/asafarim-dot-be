namespace Core.Api.Models.Resume;

public class Project
{
    public Guid Id { get; set; }
    public Guid ResumeId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string Link { get; set; } = string.Empty;
    public string? GithubUrl { get; set; }
    public string? DemoUrl { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    
    // Portfolio showcase fields
    public bool IsFeatured { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Resume? Resume { get; set; }

    // Many-to-many relationships
    public ICollection<ProjectTechnology> ProjectTechnologies { get; set; } = new List<ProjectTechnology>();
    public ICollection<ProjectPublication> ProjectPublications { get; set; } = new List<ProjectPublication>();
    public ICollection<ProjectWorkExperience> ProjectWorkExperiences { get; set; } = new List<ProjectWorkExperience>();
    public ICollection<ProjectImage> ProjectImages { get; set; } = new List<ProjectImage>();
}
