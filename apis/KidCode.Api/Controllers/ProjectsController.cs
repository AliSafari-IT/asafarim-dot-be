using System.Security.Claims;
using KidCode.Api.DTOs;
using KidCode.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KidCode.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    private string? GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    [HttpGet]
    public async Task<ActionResult<List<ProjectDto>>> GetProjects()
    {
        var projects = await _projectService.GetUserProjectsAsync(GetUserId());
        return Ok(projects);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProjectDto>> GetProject(Guid id)
    {
        var project = await _projectService.GetProjectByIdAsync(id, GetUserId());
        if (project == null)
            return NotFound();
        return Ok(project);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectDto>> CreateProject([FromBody] CreateProjectDto dto)
    {
        var project = await _projectService.CreateProjectAsync(dto, GetUserId());
        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ProjectDto>> UpdateProject(
        Guid id,
        [FromBody] UpdateProjectDto dto
    )
    {
        var project = await _projectService.UpdateProjectAsync(id, dto, GetUserId());
        if (project == null)
            return NotFound();
        return Ok(project);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        var deleted = await _projectService.DeleteProjectAsync(id, GetUserId());
        if (!deleted)
            return NotFound();
        return NoContent();
    }
}
