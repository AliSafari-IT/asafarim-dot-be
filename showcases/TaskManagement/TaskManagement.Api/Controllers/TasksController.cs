using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Api.DTOs;
using TaskManagement.Api.Models;
using TaskManagement.Api.Services;

namespace TaskManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly IPermissionService _permissionService;

    public TasksController(ITaskService taskService, IPermissionService permissionService)
    {
        _taskService = taskService;
        _permissionService = permissionService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskDto>> GetTask(Guid id)
    {
        var task = await _taskService.GetTaskByIdAsync(id);
        if (task == null)
            return NotFound();

        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        if (userId == null)
            return Unauthorized();

        if (!await _permissionService.CanAccessProjectAsync(task.ProjectId, userId))
            return Forbid();

        return Ok(task);
    }

    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<List<TaskDto>>> GetProjectTasks(
        Guid projectId,
        [FromQuery] string? status,
        [FromQuery] string? priority,
        [FromQuery] string? searchTerm,
        [FromQuery] DateTime? dueDateFrom,
        [FromQuery] DateTime? dueDateTo,
        [FromQuery] string? assignedUserId,
        [FromQuery] string sortBy = "created",
        [FromQuery] bool descending = true,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 50
    )
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        if (userId == null)
            return Unauthorized();

        if (!await _permissionService.CanAccessProjectAsync(projectId, userId))
            return Forbid();

        var filter = new TaskFilterDto
        {
            Status = string.IsNullOrEmpty(status) ? null : Enum.Parse<WorkTaskStatus>(status),
            Priority = string.IsNullOrEmpty(priority) ? null : Enum.Parse<TaskPriority>(priority),
            SearchTerm = searchTerm,
            DueDateFrom = dueDateFrom,
            DueDateTo = dueDateTo,
            AssignedUserId = assignedUserId,
            SortBy = sortBy,
            Descending = descending,
            Skip = skip,
            Take = take,
        };

        var tasks = await _taskService.GetProjectTasksAsync(projectId, filter);
        return Ok(tasks);
    }

    [HttpPost]
    public async Task<ActionResult<TaskDto>> CreateTask(CreateTaskDto dto)
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        
        Console.WriteLine($"DEBUG: CreateTask - userId: {userId ?? "NULL"}, projectId: {dto.ProjectId}, title: {dto.Title}");
        
        if (userId == null)
            return Unauthorized();

        try
        {
            var task = await _taskService.CreateTaskAsync(dto, userId);
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (KeyNotFoundException ex)
        {
            Console.WriteLine($"ERROR: Not found - {ex.Message}");
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERROR: Failed to create task: {ex.Message}");
            Console.WriteLine($"ERROR: Inner exception: {ex.InnerException?.Message}");
            Console.WriteLine($"ERROR: Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { error = ex.Message, innerError = ex.InnerException?.Message, stackTrace = ex.StackTrace });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TaskDto>> UpdateTask(Guid id, UpdateTaskDto dto)
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
            var task = await _taskService.UpdateTaskAsync(id, dto, userId);
            return Ok(task);
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

    [HttpPatch("{id}/status")]
    public async Task<ActionResult<TaskDto>> UpdateTaskStatus(Guid id, [FromBody] UpdateTaskStatusDto dto)
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
            var task = await _taskService.UpdateTaskStatusAsync(id, dto.Status, userId);
            return Ok(task);
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
    public async Task<IActionResult> DeleteTask(Guid id)
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
            await _taskService.DeleteTaskAsync(id, userId);
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

    [HttpGet("health")]
    [AllowAnonymous]
    public IActionResult Health()
    {
        return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
    }
}
