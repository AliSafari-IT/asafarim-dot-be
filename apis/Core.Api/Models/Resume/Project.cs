namespace Core.Api.Models.Resume;

public class Project
{
    public Guid Id { get; set; }
    public Guid ResumeId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Link { get; set; } = string.Empty;

    // Navigation property
    public Resume? Resume { get; set; }

    // Many-to-many with Technology
    public ICollection<ProjectTechnology> ProjectTechnologies { get; set; } = new List<ProjectTechnology>();
}
