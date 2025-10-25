using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskManagement.Api.DTOs;

namespace TaskManagement.Api.Services;

public interface IProjectService
{
    Task<ProjectDto?> GetProjectByIdAsync(Guid projectId);
    Task<List<ProjectDto>> GetUserProjectsAsync(string userId);
    Task<List<ProjectDto>> GetSharedProjectsAsync(string userId);
    Task<List<ProjectDto>> GetPublicProjectsAsync();
    Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto, string userId);
    Task<ProjectDto> UpdateProjectAsync(Guid projectId, UpdateProjectDto dto, string userId);
    Task DeleteProjectAsync(Guid projectId, string userId);
}
