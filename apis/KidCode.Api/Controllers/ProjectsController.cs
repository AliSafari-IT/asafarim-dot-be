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
    public async Task<ActionResult<List<ProjectDto>>> GetProjects(
        [FromQuery] string? mode = null,
        [FromQuery] bool? isDraft = null
    )
    {
        var projects = await _projectService.GetUserProjectsAsync(GetUserId(), mode, isDraft);
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

    [HttpPost("{id:guid}/rename")]
    public async Task<ActionResult<ProjectDto>> RenameProject(
        Guid id,
        [FromBody] RenameProjectDto dto
    )
    {
        var project = await _projectService.RenameProjectAsync(id, dto.Title, GetUserId());
        if (project == null)
            return NotFound();
        return Ok(project);
    }

    [HttpPost("{id:guid}/duplicate")]
    public async Task<ActionResult<ProjectDto>> DuplicateProject(
        Guid id,
        [FromBody] DuplicateProjectDto dto
    )
    {
        var project = await _projectService.DuplicateProjectAsync(id, dto.NewTitle, GetUserId());
        if (project == null)
            return NotFound();
        return Ok(project);
    }

    [HttpPost("{id:guid}/autosave")]
    public async Task<ActionResult<ProjectDto>> AutoSaveProject(
        Guid id,
        [FromBody] UpdateProjectDto dto
    )
    {
        var project = await _projectService.AutoSaveProjectAsync(id, dto, GetUserId());
        if (project == null)
            return NotFound();
        return Ok(project);
    }
}
