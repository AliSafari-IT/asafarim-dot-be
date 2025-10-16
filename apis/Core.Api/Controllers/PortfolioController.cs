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
    [Authorize]
    [ProducesResponseType(typeof(PublicPortfolioDto), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMyPortfolio()
    {
        try
        {
            var userId = GetUserId();
            var portfolio = await _portfolioService.GetUserPortfolioAsync(userId);

            if (portfolio == null)
            {
                return NotFound(new { message = "Portfolio not found. Please create a resume first." });
            }

            return Ok(portfolio);
        }
        catch (UnauthorizedAccessException)
        {
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
    [Authorize]
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
    [Authorize]
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
    [Authorize]
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
    [Authorize]
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
    [Authorize]
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
    [Authorize]
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
    [Authorize]
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
    [Authorize]
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
}
