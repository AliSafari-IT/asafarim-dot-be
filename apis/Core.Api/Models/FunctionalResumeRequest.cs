using System.ComponentModel.DataAnnotations;

namespace Core.Api.Models;

public sealed class FunctionalResumeRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }

    [Required]
    public string Summary { get; set; } = string.Empty;

    [Required]
    public List<string> Skills { get; set; } = new();
    public List<ProjectItem> Projects { get; set; } = new();
    public List<string> Achievements { get; set; } = new();
    public string? DetailedCv { get; set; }
}

public sealed class ProjectItem
{
    [Required]
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<string> Highlights { get; set; } = new();
}
