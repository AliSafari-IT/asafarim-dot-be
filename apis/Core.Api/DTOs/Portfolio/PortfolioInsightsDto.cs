namespace Core.Api.DTOs.Portfolio;

/// <summary>
/// Portfolio analytics and insights
/// </summary>
public class PortfolioInsightsDto
{
    public int TotalProjects { get; set; }
    public int LinkedProjects { get; set; }
    public int UnlinkedProjects { get; set; }
    public decimal LinkingRate { get; set; }
    
    public int TotalPublications { get; set; }
    public int LinkedPublications { get; set; }
    
    public int TotalResumes { get; set; }
    public int ActiveResumes { get; set; }
    
    public List<TechnologyUsageDto> MostUsedTechnologies { get; set; } = new();
    public List<ResumeUsageDto> MostLinkedResumes { get; set; } = new();
    public List<ProjectPublicationOverlapDto> ProjectPublicationOverlaps { get; set; } = new();
    
    public DateTime? LastActivityDate { get; set; }
    public string PortfolioHealth { get; set; } = "Good"; // Good, NeedsAttention, Excellent
}

public class TechnologyUsageDto
{
    public Guid TechnologyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Category { get; set; }
    public int UsageCount { get; set; }
}

public class ResumeUsageDto
{
    public Guid ResumeId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int LinkCount { get; set; }
    public DateTime LastLinked { get; set; }
}

public class ProjectPublicationOverlapDto
{
    public Guid ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public int PublicationId { get; set; }
    public string PublicationTitle { get; set; } = string.Empty;
    public int SharedResumeCount { get; set; }
}
