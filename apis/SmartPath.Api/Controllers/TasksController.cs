using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartPath.Api.Services;

namespace SmartPath.Api.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly IFamilyService _familyService;

    public TasksController(ITaskService taskService, IFamilyService familyService)
    {
        _taskService = taskService;
        _familyService = familyService;
    }

    [HttpGet]
    public async Task<IActionResult> GetTasks(
        [FromQuery] int familyId,
        [FromQuery] int? childId,
        [FromQuery] string? status
    )
    {
        var userId = (int)HttpContext.Items["UserId"]!;

        if (!await _familyService.IsMemberAsync(familyId, userId))
            return Forbid();

        var tasks = await _taskService.GetFamilyTasksAsync(familyId, childId, status);

        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTask(int id)
    {
        var task = await _taskService.GetByIdAsync(id);

        if (task == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        if (!await _familyService.IsMemberAsync(task.FamilyId, userId))
            return Forbid();

        return Ok(task);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequest request)
    {
        var userId = (int)HttpContext.Items["UserId"]!;

        if (!await _familyService.IsMemberAsync(request.FamilyId, userId))
            return Forbid();

        // Validate AssignedToUserId if provided
        if (request.AssignedToUserId.HasValue && request.AssignedToUserId.Value > 0)
        {
            if (
                !await _familyService.IsMemberAsync(
                    request.FamilyId,
                    request.AssignedToUserId.Value
                )
            )
                return BadRequest("Assigned user is not a member of this family");
        }

        var task = new Entities.Task
        {
            FamilyId = request.FamilyId,
            Title = request.Title,
            Description = request.Description,
            AssignedToUserId =
                request.AssignedToUserId.HasValue && request.AssignedToUserId.Value > 0
                    ? request.AssignedToUserId.Value
                    : userId,
            CreatedByUserId = userId,
            Category = request.Category ?? "Homework",
            Priority = request.Priority ?? "Medium",
            DueDate = request.DueDate?.ToUniversalTime(),
            EstimatedMinutes = request.EstimatedMinutes,
        };

        var created = await _taskService.CreateAsync(task);

        return CreatedAtAction(nameof(GetTask), new { id = created.TaskId }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskRequest request)
    {
        var task = await _taskService.GetByIdAsync(id);

        if (task == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        if (!await _familyService.IsMemberAsync(task.FamilyId, userId))
            return Forbid();

        if (request.Title != null)
            task.Title = request.Title;
        if (request.Description != null)
            task.Description = request.Description;
        if (request.DueDate != null)
            task.DueDate = request.DueDate.Value.ToUniversalTime();
        if (request.Status != null)
            task.Status = request.Status;
        if (request.Priority != null)
            task.Priority = request.Priority;

        var updated = await _taskService.UpdateAsync(task);

        return Ok(updated);
    }

    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompleteTask(int id)
    {
        var task = await _taskService.GetByIdAsync(id);

        if (task == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        if (!await _familyService.IsMemberAsync(task.FamilyId, userId))
            return Forbid();

        var completed = await _taskService.CompleteTaskAsync(id, userId);

        return Ok(completed);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var task = await _taskService.GetByIdAsync(id);

        if (task == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        var userRole = await _familyService.GetUserRoleAsync(task.FamilyId, userId);

        if (userRole != "FamilyAdmin" && userRole != "Parent")
            return Forbid();

        await _taskService.DeleteAsync(id);

        return NoContent();
    }

    [HttpPost("delete-bulk")]
    public async Task<IActionResult> DeleteBulkTasks([FromBody] DeleteBulkTasksRequest request)
    {
        var userId = (int)HttpContext.Items["UserId"]!;

        foreach (var taskId in request.Ids)
        {
            var task = await _taskService.GetByIdAsync(taskId);
            if (task == null)
                continue;

            var userRole = await _familyService.GetUserRoleAsync(task.FamilyId, userId);
            if (userRole != "FamilyAdmin" && userRole != "Parent")
                return Forbid();
        }

        await _taskService.DeleteBulkAsync(request.Ids);

        return NoContent();
    }

    [HttpDelete("family/{familyId}")]
    public async Task<IActionResult> DeleteFamilyTasks(int familyId)
    {
        var userId = (int)HttpContext.Items["UserId"]!;
        var userRole = await _familyService.GetUserRoleAsync(familyId, userId);

        if (userRole != "FamilyAdmin" && userRole != "Parent")
            return Forbid();

        await _taskService.DeleteByFamilyAsync(familyId);

        return NoContent();
    }
}

public record CreateTaskRequest(
    int FamilyId,
    string Title,
    string? Description,
    int? AssignedToUserId,
    string? Category,
    string? Priority,
    DateTime? DueDate,
    int? EstimatedMinutes
);

public record UpdateTaskRequest(
    string? Title,
    string? Description,
    DateTime? DueDate,
    string? Status,
    string? Priority
);

public record DeleteBulkTasksRequest(List<int> Ids);
