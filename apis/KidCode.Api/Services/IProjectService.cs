using KidCode.Api.DTOs;

namespace KidCode.Api.Services;

public interface IProjectService
{
    Task<List<ProjectDto>> GetUserProjectsAsync(
        string? userId,
        string? mode = null,
        bool? isDraft = null
    );
    Task<ProjectDto?> GetProjectByIdAsync(Guid id, string? userId);
    Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto, string? userId);
    Task<ProjectDto?> UpdateProjectAsync(Guid id, UpdateProjectDto dto, string? userId);
    Task<bool> DeleteProjectAsync(Guid id, string? userId);
    Task<ProjectDto?> RenameProjectAsync(Guid id, string newTitle, string? userId);
    Task<ProjectDto?> DuplicateProjectAsync(Guid id, string? newTitle, string? userId);
    Task<ProjectDto?> AutoSaveProjectAsync(Guid id, UpdateProjectDto dto, string? userId);
}
