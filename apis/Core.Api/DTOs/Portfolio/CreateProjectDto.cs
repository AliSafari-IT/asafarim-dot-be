using System.ComponentModel.DataAnnotations;

namespace Core.Api.DTOs.Portfolio;

public class CreateProjectDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(5000)]
    public string Description { get; set; } = string.Empty;
    
    [StringLength(300)]
    public string? ShortDescription { get; set; }
    
    [Url]
    public string? Link { get; set; }
    
    [Url]
    public string? GithubUrl { get; set; }
    
    [Url]
    public string? DemoUrl { get; set; }
    
    public DateTime? StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    public bool IsFeatured { get; set; }
    
    public int DisplayOrder { get; set; }
    
    public List<Guid> TechnologyIds { get; set; } = new();
    
    public List<int> PublicationIds { get; set; } = new();
    
    public List<Guid> WorkExperienceIds { get; set; } = new();
    
    public List<CreateProjectImageDto> Images { get; set; } = new();
}

public class UpdateProjectDto : CreateProjectDto
{
    public Guid Id { get; set; }
}

public class CreateProjectImageDto
{
    [Required]
    [Url]
    public string ImageUrl { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Caption { get; set; }
    
    public int DisplayOrder { get; set; }
    
    public bool IsPrimary { get; set; }
}
