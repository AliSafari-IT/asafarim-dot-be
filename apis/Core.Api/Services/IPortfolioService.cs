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
    
    // Resume linking - Projects
    Task<List<ResumeLinkDto>> LinkProjectToResumesAsync(Guid userId, Guid projectId, LinkResumesDto dto);
    Task<bool> UnlinkProjectFromResumeAsync(Guid userId, Guid projectId, Guid resumeId);
    Task<List<ResumeLinkDto>> GetProjectResumesAsync(Guid userId, Guid projectId);
    
    // Resume linking - Publications
    Task<List<ResumeLinkDto>> LinkPublicationToResumesAsync(Guid userId, int publicationId, LinkResumesDto dto);
    Task<bool> UnlinkPublicationFromResumeAsync(Guid userId, int publicationId, Guid resumeId);
    Task<List<ResumeLinkDto>> GetPublicationResumesAsync(Guid userId, int publicationId);
    
    // Bulk operations
    Task<int> BulkLinkResumesToProjectsAsync(Guid userId, BulkLinkResumesDto dto);
    Task<int> BulkUnlinkResumesFromProjectsAsync(Guid userId, BulkLinkResumesDto dto);
    
    // Analytics & Insights
    Task<PortfolioInsightsDto> GetPortfolioInsightsAsync(Guid userId);
    
    // Activity tracking
    Task<List<ActivityLogDto>> GetActivityLogsAsync(Guid userId, int limit = 50);
    Task<ActivityLogDto> CreateActivityLogAsync(Guid userId, CreateActivityLogDto dto);
    
    // Resume metadata
    Task<List<ResumeMetadataDto>> GetUserResumesMetadataAsync(Guid userId);
    Task<List<WorkExperienceMetadataDto>> GetResumeWorkExperiencesAsync(Guid userId, Guid resumeId);
}
