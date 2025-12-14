using KidCode.Api.Models;

namespace KidCode.Api.DTOs;

public record ProjectDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Mode { get; init; } = "drawing";
    public string BlocksJson { get; init; } = "[]";
    public string? Assets { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public record CreateProjectDto
{
    public string Title { get; init; } = string.Empty;
    public string Mode { get; init; } = "drawing";
    public string BlocksJson { get; init; } = "[]";
    public string? Assets { get; init; }
}

public record UpdateProjectDto
{
    public string? Title { get; init; }
    public string? BlocksJson { get; init; }
    public string? Assets { get; init; }
}

public static class ProjectMapper
{
    public static ProjectDto ToDto(this Project project) =>
        new()
        {
            Id = project.Id,
            Title = project.Title,
            Mode = project.Mode.ToString().ToLower(),
            BlocksJson = project.BlocksJson,
            Assets = project.Assets,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt,
        };

    public static Project ToEntity(this CreateProjectDto dto, string? userId) =>
        new()
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Mode = Enum.TryParse<ProjectMode>(dto.Mode, true, out var mode)
                ? mode
                : ProjectMode.Drawing,
            BlocksJson = dto.BlocksJson,
            Assets = dto.Assets,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
}
