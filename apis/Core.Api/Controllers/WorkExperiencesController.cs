using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Api.Controllers.Dtos;
using Core.Api.Data;
using Core.Api.Models.Resume;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Core.Api.Controllers;

[ApiController]
[Route("api/resumes/{resumeId}/[controller]")]
[Authorize]
[EnableCors("frontend")]
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

    // Handle preflight OPTIONS requests for CORS
    [HttpOptions]
    [AllowAnonymous]
    public IActionResult HandlePreflight()
    {
        return NoContent();
    }

    // GET: api/resumes/{resumeId}/workexperiences
    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkExperienceDto>>> GetWorkExperiences(
        Guid resumeId
    )
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound("Resume not found");

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var workExperiences = await _context
            .WorkExperiences.Include(w => w.Achievements)
            .Include(w => w.WorkExperienceTechnologies)
            .ThenInclude(wt => wt.Technology)
            .Where(w => w.ResumeId == resumeId)
            .OrderBy(w => w.SortOrder)
            .ThenByDescending(w => w.StartDate)
            .ToListAsync();

        return Ok(workExperiences.Select(MapToDto));
    }

    // GET: api/resumes/{resumeId}/workexperiences/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<WorkExperienceDto>> GetWorkExperience(Guid resumeId, Guid id)
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound("Resume not found");

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var workExperience = await _context
            .WorkExperiences.Include(w => w.Achievements)
            .Include(w => w.WorkExperienceTechnologies)
            .ThenInclude(wt => wt.Technology)
            .FirstOrDefaultAsync(w => w.Id == id && w.ResumeId == resumeId);
        if (workExperience == null)
            return NotFound();

        return Ok(MapToDto(workExperience));
    }

    // POST: api/resumes/{resumeId}/workexperiences
    [HttpPost]
    public async Task<ActionResult<WorkExperienceDto>> CreateWorkExperience(
        Guid resumeId,
        WorkExperienceRequest request
    )
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound("Resume not found");

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var workExperience = new WorkExperience
        {
            Id = Guid.NewGuid(),
            ResumeId = resumeId,
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
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _context.WorkExperiences.Add(workExperience);
        await _context.SaveChangesAsync();

        // Handle achievements if provided
        if (request.Achievements != null && request.Achievements.Any())
        {
            foreach (var achievementRequest in request.Achievements)
            {
                _context.WorkAchievements.Add(
                    new WorkAchievement
                    {
                        Id = Guid.NewGuid(),
                        WorkExperienceId = workExperience.Id,
                        Text = achievementRequest.Text,
                        CreatedAt = DateTime.UtcNow,
                    }
                );
            }
            await _context.SaveChangesAsync();
        }

        // Handle technologies if provided
        if (request.Technologies != null && request.Technologies.Any())
        {
            foreach (var techRequest in request.Technologies)
            {
                if (string.IsNullOrWhiteSpace(techRequest.Name))
                    continue;

                // Find or create technology
                var technology = await _context.Technologies.FirstOrDefaultAsync(t =>
                    t.Name.ToLower() == techRequest.Name.ToLower()
                );

                if (technology == null)
                {
                    technology = new Technology
                    {
                        Id = Guid.NewGuid(),
                        Name = techRequest.Name,
                        Category = techRequest.Category ?? "Other",
                    };
                    _context.Technologies.Add(technology);
                    await _context.SaveChangesAsync();
                }

                _context.WorkExperienceTechnologies.Add(
                    new WorkExperienceTechnology
                    {
                        WorkExperienceId = workExperience.Id,
                        TechnologyId = technology.Id,
                    }
                );
            }
            await _context.SaveChangesAsync();
        }

        return CreatedAtAction(
            nameof(GetWorkExperience),
            new { resumeId, id = workExperience.Id },
            MapToDto(workExperience)
        );
    }

    // PUT: api/resumes/{resumeId}/workexperiences/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateWorkExperience(
        Guid resumeId,
        Guid id,
        WorkExperienceRequest request
    )
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound("Resume not found");

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var workExperience = await _context
            .WorkExperiences.Include(w => w.Achievements)
            .Include(w => w.WorkExperienceTechnologies)
            .ThenInclude(wt => wt.Technology)
            .FirstOrDefaultAsync(w => w.Id == id && w.ResumeId == resumeId);
        if (workExperience == null)
            return NotFound();

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

        // Handle achievements - remove existing and add new ones
        if (workExperience.Achievements != null)
        {
            _context.WorkAchievements.RemoveRange(workExperience.Achievements);
        }

        if (request.Achievements != null && request.Achievements.Any())
        {
            foreach (var achievementRequest in request.Achievements)
            {
                _context.WorkAchievements.Add(
                    new WorkAchievement
                    {
                        Id = Guid.NewGuid(),
                        WorkExperienceId = workExperience.Id,
                        Text = achievementRequest.Text,
                        CreatedAt = DateTime.UtcNow,
                    }
                );
            }
        }

        // Handle technologies - smarter update logic
        if (request.Technologies != null && request.Technologies.Any())
        {
            // Get existing technology relationships for this work experience
            var existingTechRelationships = await _context.WorkExperienceTechnologies
                .Where(wt => wt.WorkExperienceId == workExperience.Id)
                .Include(wt => wt.Technology)
                .ToListAsync();

            // Remove technologies that are no longer in the request
            var requestedTechIds = request.Technologies
                .Where(t => !string.IsNullOrWhiteSpace(t.Name) && t.Id.HasValue)
                .Select(t => t.Id.Value)
                .ToList();

            var requestedTechNames = request.Technologies
                .Where(t => !string.IsNullOrWhiteSpace(t.Name))
                .Select(t => t.Name.ToLower())
                .ToList();

            var technologiesToRemove = existingTechRelationships
                .Where(wt =>
                    !requestedTechIds.Contains(wt.TechnologyId) &&
                    !requestedTechNames.Contains(wt.Technology.Name.ToLower())
                )
                .ToList();

            if (technologiesToRemove.Any())
            {
                _context.WorkExperienceTechnologies.RemoveRange(technologiesToRemove);
            }

            // Update or add new technologies
            foreach (var techRequest in request.Technologies.Where(t => !string.IsNullOrWhiteSpace(t.Name)))
            {
                Technology technology;

                if (techRequest.Id.HasValue)
                {
                    // If ID is provided, try to find by ID first
                    technology = await _context.Technologies.FindAsync(techRequest.Id.Value);
                    if (technology == null)
                    {
                        // If not found by ID but name matches an existing technology, use that
                        technology = await _context.Technologies.FirstOrDefaultAsync(t =>
                            t.Name.ToLower() == techRequest.Name.ToLower()
                        );
                    }
                }
                else
                {
                    // Find existing technology by name
                    technology = await _context.Technologies.FirstOrDefaultAsync(t =>
                        t.Name.ToLower() == techRequest.Name.ToLower()
                    );
                }

                if (technology == null)
                {
                    // Create new technology
                    technology = new Technology
                    {
                        Id = Guid.NewGuid(),
                        Name = techRequest.Name,
                        Category = techRequest.Category ?? "Other",
                    };
                    _context.Technologies.Add(technology);
                    // Don't save immediately - save all changes at the end
                }
                else
                {
                    // Update existing technology if category has changed
                    var updatedCategory = techRequest.Category ?? "Other";
                    if (technology.Category != updatedCategory)
                    {
                        // Ensure the technology is tracked by the context
                        _context.Technologies.Attach(technology);
                        technology.Category = updatedCategory;
                        // Don't save immediately - save all changes at the end
                    }
                }

                // Check if relationship already exists
                var existingRelationship = existingTechRelationships
                    .FirstOrDefault(wt => wt.TechnologyId == technology.Id);

                if (existingRelationship == null)
                {
                    // Create new relationship
                    _context.WorkExperienceTechnologies.Add(
                        new WorkExperienceTechnology
                        {
                            WorkExperienceId = workExperience.Id,
                            TechnologyId = technology.Id,
                        }
                    );
                }
            }

            // Save all new relationships
            await _context.SaveChangesAsync();
        }
        else
        {
            // If no technologies provided, remove all existing ones
            var existingTechRelationships = await _context.WorkExperienceTechnologies
                .Where(wt => wt.WorkExperienceId == workExperience.Id)
                .ToListAsync();

            if (existingTechRelationships.Any())
            {
                _context.WorkExperienceTechnologies.RemoveRange(existingTechRelationships);
                await _context.SaveChangesAsync();
            }
        }

        // Save work experience changes
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/resumes/{resumeId}/workexperiences/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteWorkExperience(Guid resumeId, Guid id)
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound("Resume not found");

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var workExperience = await _context
            .WorkExperiences.Include(w => w.Achievements)
            .Include(w => w.WorkExperienceTechnologies)
            .ThenInclude(wt => wt.Technology)
            .FirstOrDefaultAsync(w => w.Id == id && w.ResumeId == resumeId);
        if (workExperience == null)
            return NotFound();

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
                workExperience
                    .WorkExperienceTechnologies?.Where(wt => wt.Technology != null)
                    .Select(wt => new TechnologyDto
                    {
                        Id = wt.Technology!.Id,
                        Name = wt.Technology!.Name,
                        Category = wt.Technology!.Category,
                    })
                    .ToList() ?? new List<TechnologyDto>(),
        };
    }
}

// DTOs for WorkExperiencesController
public class WorkExperienceRequest
{
    public Guid? ResumeId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? Location { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public string? Description { get; set; }
    public List<WorkAchievementRequest>? Achievements { get; set; }
    public List<WorkTechnologyRequest>? Technologies { get; set; }
    public int SortOrder { get; set; }
    public bool Highlighted { get; set; } = false;
    public bool IsPublished { get; set; } = true;
}

public class WorkAchievementRequest
{
    public string Text { get; set; } = string.Empty;
}

public class WorkTechnologyRequest
{
    public Guid? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Category { get; set; }
}
