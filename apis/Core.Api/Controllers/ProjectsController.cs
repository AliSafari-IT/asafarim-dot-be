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
[Route("api/resumes/{resumeId}/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly CoreDbContext _context;
    private readonly ILogger<ProjectsController> _logger;

    public ProjectsController(CoreDbContext context, ILogger<ProjectsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/resumes/{resumeId}/projects
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjectDto>>> GetProjects(Guid resumeId)
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

        var projects = await _context
            .Projects.Include(p => p.ProjectTechnologies)
            .ThenInclude(pt => pt.Technology)
            .Where(p => p.ResumeId == resumeId)
            .OrderBy(p => p.Name)
            .ToListAsync();

        return Ok(projects.Select(MapToDto));
    }

    // GET: api/resumes/{resumeId}/projects/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectDto>> GetProject(Guid resumeId, Guid id)
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

        var project = await _context
            .Projects.Include(p => p.ProjectTechnologies)
            .ThenInclude(pt => pt.Technology)
            .FirstOrDefaultAsync(p => p.Id == id && p.ResumeId == resumeId);

        if (project == null)
            return NotFound();

        return Ok(MapToDto(project));
    }

    // POST: api/resumes/{resumeId}/projects
    [HttpPost]
    public async Task<ActionResult<ProjectDto>> CreateProject(
        Guid resumeId,
        CreateProjectRequest request
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

        var project = new Project
        {
            Id = Guid.NewGuid(),
            ResumeId = resumeId,
            Name = request.Name,
            Description = request.Description,
            Link = request.Link,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

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

                _context.ProjectTechnologies.Add(
                    new ProjectTechnology { ProjectId = project.Id, TechnologyId = technology.Id }
                );
            }
            await _context.SaveChangesAsync();
        }

        return CreatedAtAction(
            nameof(GetProject),
            new { resumeId, id = project.Id },
            MapToDto(project)
        );
    }

    // PUT: api/resumes/{resumeId}/projects/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProject(
        Guid resumeId,
        Guid id,
        UpdateProjectRequest request
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

        var project = await _context
            .Projects.Include(p => p.ProjectTechnologies)
            .FirstOrDefaultAsync(p => p.Id == id && p.ResumeId == resumeId);

        if (project == null)
            return NotFound();

        project.Name = request.Name;
        project.Description = request.Description;
        project.Link = request.Link;
        project.StartDate = request.StartDate;
        project.EndDate = request.EndDate;

        // Handle technologies - remove existing and add new ones
        if (project.ProjectTechnologies != null)
        {
            _context.ProjectTechnologies.RemoveRange(project.ProjectTechnologies);
        }

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

                _context.ProjectTechnologies.Add(
                    new ProjectTechnology { ProjectId = project.Id, TechnologyId = technology.Id }
                );
            }
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/resumes/{resumeId}/projects/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(Guid resumeId, Guid id)
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

        var project = await _context
            .Projects.Include(p => p.ProjectTechnologies)
            .FirstOrDefaultAsync(p => p.Id == id && p.ResumeId == resumeId);

        if (project == null)
            return NotFound();

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static ProjectDto MapToDto(Project project)
    {
        return new ProjectDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            Link = project.Link,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            Technologies =
                project
                    .ProjectTechnologies?.Select(pt => new TechnologyDto
                    {
                        Id = pt.Technology.Id,
                        Name = pt.Technology.Name,
                        Category = pt.Technology.Category,
                    })
                    .ToList() ?? new List<TechnologyDto>(),
        };
    }
}

// DTOs for ProjectsController
public class CreateProjectRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Link { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<ProjectTechnologyRequest>? Technologies { get; set; }
}

public class UpdateProjectRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Link { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<ProjectTechnologyRequest>? Technologies { get; set; }
}

public class ProjectTechnologyRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Category { get; set; }
}
