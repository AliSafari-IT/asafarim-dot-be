using Core.Api.DTOs.Portfolio;
using Core.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Core.Api.Controllers;

/// <summary>
/// Portfolio Showcase API - Manage and display user portfolios
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PortfolioController : ControllerBase
{
    private readonly IPortfolioService _portfolioService;
    private readonly ILogger<PortfolioController> _logger;

    public PortfolioController(IPortfolioService portfolioService, ILogger<PortfolioController> logger)
    {
        _portfolioService = portfolioService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("User ID not found in claims");
        }
        return userId;
    }

    /// <summary>
    /// GET /api/portfolio/{publicSlug} - Get public portfolio by slug
    /// </summary>
    /// <param name="publicSlug">Public slug (e.g., "john-doe")</param>
    /// <returns>Public portfolio data</returns>
    [HttpGet("{publicSlug}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PublicPortfolioDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetPublicPortfolio(string publicSlug)
    {
        try
        {
            var portfolio = await _portfolioService.GetPublicPortfolioBySlugAsync(publicSlug);

            if (portfolio == null)
            {
                return NotFound(new { message = "Portfolio not found or not public" });
            }

            return Ok(portfolio);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving public portfolio for slug: {Slug}", publicSlug);
            return StatusCode(500, new { message = "An error occurred while retrieving the portfolio" });
        }
    }

    /// <summary>
    /// GET /api/portfolio - Get current user's portfolio (authenticated)
    /// </summary>
    /// <returns>User's portfolio data</returns>
    [HttpGet]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(typeof(PublicPortfolioDto), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMyPortfolio()
    {
        try
        {
            _logger.LogInformation("GetMyPortfolio called");
            _logger.LogInformation("User.Identity.IsAuthenticated: {IsAuth}", User.Identity?.IsAuthenticated);
            _logger.LogInformation("User.Identity.Name: {Name}", User.Identity?.Name);
            _logger.LogInformation("Claims count: {Count}", User.Claims.Count());
            
            foreach (var claim in User.Claims)
            {
                _logger.LogInformation("Claim: {Type} = {Value}", claim.Type, claim.Value);
            }

            var userId = GetUserId();
            _logger.LogInformation("Retrieved UserId: {UserId}", userId);
            
            var portfolio = await _portfolioService.GetUserPortfolioAsync(userId);

            if (portfolio == null)
            {
                _logger.LogWarning("Portfolio not found for user {UserId}", userId);
                return NotFound(new { message = "Portfolio not found. Please create a resume first." });
            }

            _logger.LogInformation("Portfolio found for user {UserId}", userId);
            return Ok(portfolio);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt");
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user portfolio");
            return StatusCode(500, new { message = "An error occurred while retrieving your portfolio" });
        }
    }

    /// <summary>
    /// GET /api/portfolio/settings - Get portfolio settings
    /// </summary>
    /// <returns>Portfolio settings</returns>
    [HttpGet("settings")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(typeof(PortfolioSettingsDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetSettings()
    {
        try
        {
            var userId = GetUserId();
            var settings = await _portfolioService.GetPortfolioSettingsAsync(userId);

            if (settings == null)
            {
                return NotFound(new { message = "Portfolio settings not found. Please create settings first." });
            }

            return Ok(settings);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving portfolio settings");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// PUT /api/portfolio/settings - Update portfolio settings
    /// </summary>
    /// <param name="dto">Portfolio settings update data</param>
    /// <returns>Updated settings</returns>
    [HttpPut("settings")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(typeof(PortfolioSettingsDto), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdatePortfolioSettingsDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var userId = GetUserId();

            // Check if slug is available
            var isAvailable = await _portfolioService.IsPublicSlugAvailableAsync(dto.PublicSlug, userId);
            if (!isAvailable)
            {
                return BadRequest(new { message = "Public slug is already taken. Please choose another." });
            }

            var settings = await _portfolioService.UpdatePortfolioSettingsAsync(userId, dto);
            return Ok(settings);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating portfolio settings");
            return StatusCode(500, new { message = "An error occurred while updating settings" });
        }
    }

    /// <summary>
    /// POST /api/portfolio/projects - Create a new project
    /// </summary>
    /// <param name="dto">Project creation data</param>
    /// <returns>Created project</returns>
    [HttpPost("projects")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(typeof(ProjectShowcaseDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var userId = GetUserId();
            var project = await _portfolioService.CreateProjectAsync(userId, dto);

            return CreatedAtAction(
                nameof(GetProjectById),
                new { id = project.Id },
                project
            );
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating project");
            return StatusCode(500, new { message = "An error occurred while creating the project" });
        }
    }

    /// <summary>
    /// PUT /api/portfolio/projects/{id} - Update a project
    /// </summary>
    /// <param name="id">Project ID</param>
    /// <param name="dto">Project update data</param>
    /// <returns>Updated project</returns>
    [HttpPut("projects/{id}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(typeof(ProjectShowcaseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateProject(Guid id, [FromBody] UpdateProjectDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var userId = GetUserId();
            var project = await _portfolioService.UpdateProjectAsync(userId, id, dto);

            if (project == null)
            {
                return NotFound(new { message = "Project not found or you don't have permission to edit it" });
            }

            return Ok(project);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating project {ProjectId}", id);
            return StatusCode(500, new { message = "An error occurred while updating the project" });
        }
    }

    /// <summary>
    /// DELETE /api/portfolio/projects/{id} - Delete a project
    /// </summary>
    /// <param name="id">Project ID</param>
    /// <returns>No content on success</returns>
    [HttpDelete("projects/{id}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        try
        {
            var userId = GetUserId();
            var deleted = await _portfolioService.DeleteProjectAsync(userId, id);

            if (!deleted)
            {
                return NotFound(new { message = "Project not found or you don't have permission to delete it" });
            }

            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting project {ProjectId}", id);
            return StatusCode(500, new { message = "An error occurred while deleting the project" });
        }
    }

    /// <summary>
    /// GET /api/portfolio/projects - Get all user's projects
    /// </summary>
    /// <returns>List of projects</returns>
    [HttpGet("projects")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(typeof(List<ProjectShowcaseDto>), 200)]
    public async Task<IActionResult> GetMyProjects()
    {
        try
        {
            var userId = GetUserId();
            var projects = await _portfolioService.GetUserProjectsAsync(userId);
            return Ok(projects);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user projects");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// GET /api/portfolio/projects/{id} - Get project by ID
    /// </summary>
    /// <param name="id">Project ID</param>
    /// <returns>Project details</returns>
    [HttpGet("projects/{id}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(typeof(ProjectShowcaseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetProjectById(Guid id)
    {
        try
        {
            var userId = GetUserId();
            var project = await _portfolioService.GetProjectByIdAsync(userId, id);

            if (project == null)
            {
                return NotFound(new { message = "Project not found" });
            }

            return Ok(project);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving project {ProjectId}", id);
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// GET /api/portfolio/slug-available/{slug} - Check if public slug is available
    /// </summary>
    /// <param name="slug">Slug to check</param>
    /// <returns>Availability status</returns>
    [HttpGet("slug-available/{slug}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(typeof(object), 200)]
    public async Task<IActionResult> CheckSlugAvailability(string slug)
    {
        try
        {
            var userId = GetUserId();
            var isAvailable = await _portfolioService.IsPublicSlugAvailableAsync(slug, userId);
            return Ok(new { available = isAvailable });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking slug availability");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    // ==================== Resume Linking - Projects ====================

    /// <summary>
    /// POST /api/portfolio/projects/{id}/link-resumes - Link resumes to a project
    /// </summary>
    [HttpPost("projects/{id}/link-resumes")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(typeof(List<ResumeLinkDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> LinkProjectToResumes(Guid id, [FromBody] LinkResumesDto dto)
    {
        try
        {
            var userId = GetUserId();
            var links = await _portfolioService.LinkProjectToResumesAsync(userId, id, dto);
            return Ok(links);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error linking resumes to project {ProjectId}", id);
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// DELETE /api/portfolio/projects/{id}/resumes/{resumeId} - Unlink resume from project
    /// </summary>
    [HttpDelete("projects/{id}/resumes/{resumeId}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UnlinkProjectFromResume(Guid id, Guid resumeId)
    {
        try
        {
            var userId = GetUserId();
            var success = await _portfolioService.UnlinkProjectFromResumeAsync(userId, id, resumeId);
            
            if (!success)
            {
                return NotFound(new { message = "Link not found" });
            }

            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unlinking resume from project");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// GET /api/portfolio/projects/{id}/resumes - Get resumes linked to a project
    /// </summary>
    [HttpGet("projects/{id}/resumes")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(typeof(List<ResumeLinkDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetProjectResumes(Guid id)
    {
        try
        {
            var userId = GetUserId();
            var links = await _portfolioService.GetProjectResumesAsync(userId, id);
            return Ok(links);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting project resumes");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    // ==================== Resume Linking - Publications ====================

    /// <summary>
    /// POST /api/portfolio/publications/{id}/link-resumes - Link resumes to a publication
    /// </summary>
    [HttpPost("publications/{id}/link-resumes")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(typeof(List<ResumeLinkDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> LinkPublicationToResumes(int id, [FromBody] LinkResumesDto dto)
    {
        try
        {
            var userId = GetUserId();
            var links = await _portfolioService.LinkPublicationToResumesAsync(userId, id, dto);
            return Ok(links);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error linking resumes to publication {PublicationId}", id);
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// DELETE /api/portfolio/publications/{id}/resumes/{resumeId} - Unlink resume from publication
    /// </summary>
    [HttpDelete("publications/{id}/resumes/{resumeId}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UnlinkPublicationFromResume(int id, Guid resumeId)
    {
        try
        {
            var userId = GetUserId();
            var success = await _portfolioService.UnlinkPublicationFromResumeAsync(userId, id, resumeId);
            
            if (!success)
            {
                return NotFound(new { message = "Link not found" });
            }

            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unlinking resume from publication");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// GET /api/portfolio/publications/{id}/resumes - Get resumes linked to a publication
    /// </summary>
    [HttpGet("publications/{id}/resumes")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(typeof(List<ResumeLinkDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetPublicationResumes(int id)
    {
        try
        {
            var userId = GetUserId();
            var links = await _portfolioService.GetPublicationResumesAsync(userId, id);
            return Ok(links);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting publication resumes");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    // ==================== Bulk Operations ====================

    /// <summary>
    /// POST /api/portfolio/projects/bulk-link - Bulk link resumes to multiple projects
    /// </summary>
    [HttpPost("projects/bulk-link")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(typeof(object), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> BulkLinkResumesToProjects([FromBody] BulkLinkResumesDto dto)
    {
        try
        {
            var userId = GetUserId();
            var count = await _portfolioService.BulkLinkResumesToProjectsAsync(userId, dto);
            return Ok(new { linkedCount = count, message = $"Successfully linked {count} connections" });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error bulk linking resumes to projects");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// POST /api/portfolio/projects/bulk-unlink - Bulk unlink resumes from multiple projects
    /// </summary>
    [HttpPost("projects/bulk-unlink")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(typeof(object), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> BulkUnlinkResumesFromProjects([FromBody] BulkLinkResumesDto dto)
    {
        try
        {
            var userId = GetUserId();
            var count = await _portfolioService.BulkUnlinkResumesFromProjectsAsync(userId, dto);
            return Ok(new { unlinkedCount = count, message = $"Successfully unlinked {count} connections" });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error bulk unlinking resumes from projects");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    // ==================== Analytics & Insights ====================

    /// <summary>
    /// GET /api/portfolio/insights - Get portfolio analytics and insights
    /// </summary>
    [HttpGet("insights")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(typeof(PortfolioInsightsDto), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetPortfolioInsights()
    {
        try
        {
            var userId = GetUserId();
            var insights = await _portfolioService.GetPortfolioInsightsAsync(userId);
            return Ok(insights);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting portfolio insights");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    // ==================== Activity Tracking ====================

    /// <summary>
    /// GET /api/portfolio/activity - Get user activity timeline
    /// </summary>
    [HttpGet("activity")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(typeof(List<ActivityLogDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetActivityLogs([FromQuery] int limit = 50)
    {
        try
        {
            var userId = GetUserId();
            var logs = await _portfolioService.GetActivityLogsAsync(userId, limit);
            return Ok(logs);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting activity logs");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// POST /api/portfolio/activity - Log an activity event
    /// </summary>
    [HttpPost("activity")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(typeof(ActivityLogDto), 201)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateActivityLog([FromBody] CreateActivityLogDto dto)
    {
        try
        {
            var userId = GetUserId();
            var log = await _portfolioService.CreateActivityLogAsync(userId, dto);
            return CreatedAtAction(nameof(GetActivityLogs), new { }, log);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating activity log");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    // ==================== Resume Metadata ====================

    /// <summary>
    /// GET /api/portfolio/resumes/metadata - Get metadata of all user resumes
    /// </summary>
    [HttpGet("resumes/metadata")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(typeof(List<ResumeMetadataDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetUserResumesMetadata()
    {
        try
        {
            var userId = GetUserId();
            var resumes = await _portfolioService.GetUserResumesMetadataAsync(userId);
            return Ok(resumes);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting resumes metadata");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// GET /api/portfolio/resumes/{id}/work-experiences - Get work experiences in a resume
    /// </summary>
    [HttpGet("resumes/{id}/work-experiences")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ProducesResponseType(typeof(List<WorkExperienceMetadataDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetResumeWorkExperiences(Guid id)
    {
        try
        {
            var userId = GetUserId();
            var workExperiences = await _portfolioService.GetResumeWorkExperiencesAsync(userId, id);
            return Ok(workExperiences);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting resume work experiences");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }
}
