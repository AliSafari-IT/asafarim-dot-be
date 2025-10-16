using System.ComponentModel.DataAnnotations;

namespace Core.Api.DTOs.Portfolio;

public class PortfolioSettingsDto
{
    public Guid Id { get; set; }
    
    [Required]
    [RegularExpression(@"^[a-z0-9-]+$", ErrorMessage = "Public slug must contain only lowercase letters, numbers, and hyphens")]
    [StringLength(100, MinimumLength = 3)]
    public string PublicSlug { get; set; } = string.Empty;
    
    public bool IsPublic { get; set; }
    
    public string? Theme { get; set; }
    
    public List<string>? SectionOrder { get; set; }
    
    public DateTime UpdatedAt { get; set; }
}

public class UpdatePortfolioSettingsDto
{
    [Required]
    [RegularExpression(@"^[a-z0-9-]+$")]
    [StringLength(100, MinimumLength = 3)]
    public string PublicSlug { get; set; } = string.Empty;
    
    public bool IsPublic { get; set; }
    
    public string? Theme { get; set; }
    
    public List<string>? SectionOrder { get; set; }
}
