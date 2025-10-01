using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Api.Controllers.Dtos;
using Core.Api.Data;
using Core.Api.Models.Resume;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Core.Api.Controllers;

[ApiController]
[Route("api/work-experiences")]
public class WorkExperiencesController : ControllerBase
{
    private readonly CoreDbContext _context;
    private readonly ILogger<WorkExperiencesController> _logger;

    public WorkExperiencesController(
        CoreDbContext context,
        ILogger<WorkExperiencesController> logger
    )
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/work-experiences
    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkExperienceDto>>> GetWorkExperiences(
        [FromQuery] string? companyName = null,
        [FromQuery] string? title = null,
        [FromQuery] bool? myExperiences = null
    )
    {
        _logger.LogInformation(
            "Getting work experiences with companyName: {CompanyName}, title: {Title}, myExperiences: {MyExperiences}",
            companyName,
            title,
            myExperiences
        );

        var query = _context
            .WorkExperiences.Include(w => w.Achievements)
            .Include(w => w.WorkExperienceTechnologies)
            .ThenInclude(wt => wt.Technology)
            .AsQueryable();

        // Get current user ID for filtering
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;

        _logger.LogInformation(
            "Current user ID: {UserId}, IsAuthenticated: {IsAuthenticated}",
            userId,
            User.Identity?.IsAuthenticated
        );

        // Filter by current user if requested
        if (myExperiences == true && User.Identity?.IsAuthenticated == true)
        {
            if (!string.IsNullOrEmpty(userId))
            {
                _logger.LogInformation("Filtering work experiences for user: {UserId}", userId);
                query = query.Where(w => w.UserId == userId);
            }
            else
            {
                _logger.LogWarning("myExperiences=true but userId is null or empty");
            }
        }

        // Apply filters if provided
        if (!string.IsNullOrEmpty(companyName))
        {
            query = query.Where(w => w.CompanyName.Contains(companyName));
        }

        if (!string.IsNullOrEmpty(title))
        {
            query = query.Where(w => w.JobTitle.Contains(title));
        }

        // Only return published items if NOT requesting user's own experiences
        // Users should see all their own experiences (published and unpublished)
        if (myExperiences != true)
        {
            query = query.Where(w => w.IsPublished);
        }

        // Order by sort order and then by start date descending
        query = query.OrderBy(w => w.SortOrder).ThenByDescending(w => w.StartDate);

        var workExperiences = await query.ToListAsync();

        return Ok(workExperiences.Select(w => MapToDto(w)));
    }

    // GET: api/work-experiences/5
    [HttpGet("{id}")]
    public async Task<ActionResult<WorkExperienceDto>> GetWorkExperience(Guid id)
    {
        _logger.LogInformation("Getting work experience with id: {Id}", id);

        var workExperience = await _context
            .WorkExperiences.Include(w => w.Achievements)
            .Include(w => w.WorkExperienceTechnologies)
            .ThenInclude(wt => wt.Technology)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workExperience == null)
        {
            return NotFound();
        }

        return MapToDto(workExperience);
    }

    // POST: api/work-experiences
    [HttpPost]
    [Authorize] // Any authenticated user can create work experiences
    public async Task<ActionResult<WorkExperienceDto>> CreateWorkExperience(
        WorkExperienceRequest request
    )
    {
        try
        {
            _logger.LogInformation(
                "Creating new work experience: {JobTitle} at {CompanyName}",
                request.JobTitle,
                request.CompanyName
            );
            _logger.LogInformation("Request details: {@Request}", request);

            // Get the current user ID from the claims
            var userId =
                User.FindFirst("sub")?.Value
                ?? User.FindFirst(
                    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
                )?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in token");
            }

            var workExperience = new WorkExperience
            {
                JobTitle = request.JobTitle,
                CompanyName = request.CompanyName,
                Location = request.Location,
                StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc),
                EndDate = request.EndDate.HasValue
                    ? DateTime.SpecifyKind(request.EndDate.Value, DateTimeKind.Utc)
                    : null,
                IsCurrent = request.IsCurrent,
                Description = request.Description,
                SortOrder = request.SortOrder,
                Highlighted = request.Highlighted,
                IsPublished = request.IsPublished,
                UserId = userId, // Set the user ID
                CreatedAt = DateTime.UtcNow,
            };

            _context.WorkExperiences.Add(workExperience);
            await _context.SaveChangesAsync();

            // Add achievements if provided
            if (request.Achievements != null && request.Achievements.Count > 0)
            {
                foreach (var achievement in request.Achievements)
                {
                    _context.WorkAchievements.Add(
                        new WorkAchievement
                        {
                            WorkExperienceId = workExperience.Id,
                            Text = achievement.Text,
                            CreatedAt = DateTime.UtcNow,
                        }
                    );
                }
                await _context.SaveChangesAsync();
            }

            // Reload the work experience with achievements
            if (workExperience != null)
            {
                workExperience = await _context
                    .WorkExperiences.Include(w => w.Achievements)
                    .FirstOrDefaultAsync(w => w.Id == workExperience.Id);
            }

            return CreatedAtAction(
                nameof(GetWorkExperience),
                new { id = workExperience?.Id ?? Guid.Empty },
                workExperience != null ? MapToDto(workExperience) : null
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating work experience: {Message}", ex.Message);
            return StatusCode(
                500,
                "An error occurred while creating the work experience. Please try again later."
            );
        }
    }

    // PUT: api/work-experiences/5
    [HttpPut("{id}")]
    [Authorize] // Any authenticated user can update their own work experiences
    public async Task<IActionResult> UpdateWorkExperience(Guid id, WorkExperienceRequest request)
    {
        _logger.LogInformation("Updating work experience with id: {Id}", id);

        // Get the current user ID from the claims
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User ID not found in token");
        }

        var workExperience = await _context
            .WorkExperiences.Include(w => w.Achievements)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workExperience == null)
        {
            return NotFound();
        }

        // Check if the user owns this work experience or is an admin
        bool isAdmin = User.IsInRole("admin") || User.IsInRole("Admin");
        bool isAdminEdit =
            Request.Query.ContainsKey("isAdminEdit") || Request.Headers.ContainsKey("X-Admin-Edit");

        _logger.LogInformation(
            "Update permission check - UserId: {UserId}, WorkExperienceUserId: {WorkExperienceUserId}, IsAdmin: {IsAdmin}, IsAdminEdit: {IsAdminEdit}",
            userId,
            workExperience.UserId,
            isAdmin,
            isAdminEdit
        );

        if (workExperience.UserId != userId && !(isAdmin && isAdminEdit))
        {
            return Forbid("You do not have permission to update this work experience");
        }

        // Update work experience properties
        workExperience.JobTitle = request.JobTitle;
        workExperience.CompanyName = request.CompanyName;
        workExperience.Location = request.Location;
        workExperience.StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc);
        workExperience.EndDate = request.EndDate.HasValue
            ? DateTime.SpecifyKind(request.EndDate.Value, DateTimeKind.Utc)
            : null;
        workExperience.IsCurrent = request.IsCurrent;
        workExperience.Description = request.Description;
        workExperience.SortOrder = request.SortOrder;
        workExperience.Highlighted = request.Highlighted;
        workExperience.IsPublished = request.IsPublished;
        workExperience.UpdatedAt = DateTime.UtcNow;

        // Update achievements
        if (request.Achievements != null)
        {
            // Remove existing achievements
            if (workExperience.Achievements != null && workExperience.Achievements.Any())
            {
                _context.WorkAchievements.RemoveRange(workExperience.Achievements);
            }

            // Add new achievements
            foreach (var achievement in request.Achievements)
            {
                _context.WorkAchievements.Add(
                    new WorkAchievement
                    {
                        WorkExperienceId = workExperience.Id,
                        Text = achievement.Text,
                        CreatedAt = DateTime.UtcNow,
                    }
                );
            }
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/work-experiences/5
    [HttpDelete("{id}")]
    [Authorize] // Any authenticated user can delete their own work experiences
    public async Task<IActionResult> DeleteWorkExperience(int id)
    {
        _logger.LogInformation("Deleting work experience with id: {Id}", id);

        // Get the current user ID from the claims
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User ID not found in token");
        }

        var workExperience = await _context.WorkExperiences.FindAsync(id);
        if (workExperience == null)
        {
            return NotFound();
        }

        // Check if the user owns this work experience or is an admin
        bool isAdmin = User.IsInRole("admin") || User.IsInRole("Admin");
        bool isAdminEdit =
            Request.Query.ContainsKey("isAdminEdit") || Request.Headers.ContainsKey("X-Admin-Edit");

        _logger.LogInformation(
            "Delete permission check - UserId: {UserId}, WorkExperienceUserId: {WorkExperienceUserId}, IsAdmin: {IsAdmin}, IsAdminEdit: {IsAdminEdit}",
            userId,
            workExperience.UserId,
            isAdmin,
            isAdminEdit
        );

        if (workExperience.UserId != userId && !(isAdmin && isAdminEdit))
        {
            return Forbid("You do not have permission to delete this work experience");
        }

        _context.WorkExperiences.Remove(workExperience);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static WorkExperienceDto MapToDto(WorkExperience workExperience)
    {
        return new WorkExperienceDto
        {
            Id = workExperience.Id,
            JobTitle = workExperience.JobTitle,
            CompanyName = workExperience.CompanyName,
            Location = workExperience.Location,
            StartDate = workExperience.StartDate,
            EndDate = workExperience.EndDate,
            IsCurrent = workExperience.IsCurrent,
            Description = workExperience.Description,
            Achievements = workExperience
                .Achievements?.Select(a => new WorkAchievementDto { Id = a.Id, Text = a.Text })
                .ToList(),
            SortOrder = workExperience.SortOrder,
            Highlighted = workExperience.Highlighted,
            IsPublished = workExperience.IsPublished,
            UserId = workExperience.UserId,
            CreatedAt = workExperience.CreatedAt,
            UpdatedAt = workExperience.UpdatedAt,
            Technologies =
                workExperience.WorkExperienceTechnologies?.Select(wt => wt.Technology.Name).ToList()
                ?? new List<string>(),
        };
    }
}

// DTOs (WorkExperienceDto, WorkAchievementDto) are now in Core.Api.Controllers.Resume.ResumeDtos.cs

public class WorkExperienceRequest
{
    public string JobTitle { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? Location { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public string? Description { get; set; }
    public List<WorkAchievementRequest>? Achievements { get; set; }
    public int SortOrder { get; set; }
    public bool Highlighted { get; set; } = false;
    public bool IsPublished { get; set; } = true;
}

public class WorkAchievementRequest
{
    public string Text { get; set; } = string.Empty;
}
