namespace Core.Api.DTOs.Portfolio;

/// <summary>
/// Public portfolio data for showcase page
/// </summary>
public class PublicPortfolioDto
{
    public string UserName { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? Bio { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? Email { get; set; }
    public string? Location { get; set; }
    public string? Website { get; set; }
    public string? GithubUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public string PreferredLanguage { get; set; } = "en";
    public DateTime? LastUpdated { get; set; }
    
    public List<ProjectShowcaseDto> FeaturedProjects { get; set; } = new();
    public List<ProjectShowcaseDto> AllProjects { get; set; } = new();
    public List<TechnologyDto> Technologies { get; set; } = new();
    public List<WorkExperienceDto> WorkExperiences { get; set; } = new();
    public List<PublicationDto> Publications { get; set; } = new();
}

public class ProjectShowcaseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? Link { get; set; }
    public string? GithubUrl { get; set; }
    public string? DemoUrl { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsFeatured { get; set; }
    public int DisplayOrder { get; set; }
    
    public List<TechnologyDto> Technologies { get; set; } = new();
    public List<ProjectImageDto> Images { get; set; } = new();
    public List<string> PublicationTitles { get; set; } = new();
    public List<string> RelatedWorkExperiences { get; set; } = new();
}

public class ProjectImageDto
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? Caption { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsPrimary { get; set; }
}

public class TechnologyDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Category { get; set; }
    public int? ProficiencyLevel { get; set; }
}

public class WorkExperienceDto
{
    public Guid Id { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? Location { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Description { get; set; }
}

public class PublicationDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Authors { get; set; }
    public string? Journal { get; set; }
    public DateTime? PublishedDate { get; set; }
    public string? Url { get; set; }
}
