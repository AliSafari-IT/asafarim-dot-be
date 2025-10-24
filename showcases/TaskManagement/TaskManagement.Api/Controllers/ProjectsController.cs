using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Api.Data;
using TaskManagement.Api.DTOs;
using TaskManagement.Api.Services;

namespace TaskManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
// [Authorize] // Removed for development - handle auth in methods
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;
    private readonly TaskManagementDbContext _context;

    public ProjectsController(IProjectService projectService, TaskManagementDbContext context)
    {
        _projectService = projectService;
        _context = context;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectDto>> GetProject(Guid id)
    {
        var project = await _projectService.GetProjectByIdAsync(id);
        if (project == null)
            return NotFound();
        return Ok(project);
    }

    [HttpGet("health")]
    [AllowAnonymous]
    public async Task<ActionResult<string>> HealthCheck()
    {
        try
        {
            var projectCount = await _context.Projects.CountAsync();
            return Ok($"TaskManagement API is running. Projects in database: {projectCount}");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Database error: {ex.Message}");
        }
    }

    [HttpGet("my-projects")]
    public async Task<ActionResult<List<ProjectDto>>> GetMyProjects()
    {
        try
        {
            var userId =
                User.FindFirst("sub")?.Value
                ?? User.FindFirst(
                    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
                )?.Value;

            if (userId == null)
            {
                return Unauthorized(new { error = "User authentication required" });
            }

            Console.WriteLine($"DEBUG: User ID extracted from token: {userId}");

            var projects = await _projectService.GetUserProjectsAsync(userId);
            Console.WriteLine($"DEBUG: Found {projects.Count} projects for user {userId}");

            return Ok(projects);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"DEBUG: Error in GetMyProjects: {ex.Message}");
            Console.WriteLine($"DEBUG: Stack trace: {ex.StackTrace}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("shared")]
    public async Task<ActionResult<List<ProjectDto>>> GetSharedProjects()
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        if (userId == null)
            return Unauthorized();

        var projects = await _projectService.GetSharedProjectsAsync(userId);
        return Ok(projects);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectDto>> CreateProject(CreateProjectDto dto)
    {
        try
        {
            var userId =
                User.FindFirst("sub")?.Value
                ?? User.FindFirst(
                    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
                )?.Value;

            if (userId == null)
            {
                return Unauthorized(new { error = "User authentication required" });
            }

            Console.WriteLine($"DEBUG: Creating project for user: {userId}");

            var project = await _projectService.CreateProjectAsync(dto, userId);
            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"DEBUG: Error in CreateProject: {ex.Message}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProjectDto>> UpdateProject(Guid id, UpdateProjectDto dto)
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        if (userId == null)
            return Unauthorized();

        try
        {
            var project = await _projectService.UpdateProjectAsync(id, dto, userId);
            return Ok(project);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        if (userId == null)
            return Unauthorized();

        try
        {
            await _projectService.DeleteProjectAsync(id, userId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}
