using Core.Api.DTOs.Portfolio;

namespace Core.Api.Services;

/// <summary>
/// Portfolio service interface for business logic
/// </summary>
public interface IPortfolioService
{
    // Public portfolio retrieval
    Task<PublicPortfolioDto?> GetPublicPortfolioBySlugAsync(string publicSlug);
    Task<PublicPortfolioDto?> GetUserPortfolioAsync(Guid userId);
    
    // Portfolio settings
    Task<PortfolioSettingsDto?> GetPortfolioSettingsAsync(Guid userId);
    Task<PortfolioSettingsDto> UpdatePortfolioSettingsAsync(Guid userId, UpdatePortfolioSettingsDto dto);
    Task<bool> IsPublicSlugAvailableAsync(string publicSlug, Guid? excludeUserId = null);
    
    // Project management
    Task<ProjectShowcaseDto> CreateProjectAsync(Guid userId, CreateProjectDto dto);
    Task<ProjectShowcaseDto?> UpdateProjectAsync(Guid userId, Guid projectId, UpdateProjectDto dto);
    Task<bool> DeleteProjectAsync(Guid userId, Guid projectId);
    Task<List<ProjectShowcaseDto>> GetUserProjectsAsync(Guid userId);
    Task<ProjectShowcaseDto?> GetProjectByIdAsync(Guid userId, Guid projectId);
}
