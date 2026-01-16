using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartPath.Api.DTOs;
using SmartPath.Api.Services;
using IAuthorizationService = SmartPath.Api.Services.IAuthorizationService;

namespace SmartPath.Api.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly IFamilyService _familyService;
    private readonly IAuthorizationService _authService;
    private readonly ILogger<TasksController> _logger;

    public TasksController(
        ITaskService taskService,
        IFamilyService familyService,
        IAuthorizationService authService,
        ILogger<TasksController> logger
    )
    {
        _taskService = taskService;
        _familyService = familyService;
        _authService = authService;
        _logger = logger;
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

        var accessibleTaskIds = await _authService.GetAccessibleTaskIdsAsync(familyId, userId);
        var tasks = await _taskService.GetFamilyTasksAsync(familyId, childId, status);
        var filteredTasks = tasks.Where(t => accessibleTaskIds.Contains(t.TaskId)).ToList();

        var responseTasks = filteredTasks.Select(MapTaskToResponse).ToList();
        return Ok(responseTasks);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTask(int id)
    {
        var task = await _taskService.GetByIdAsync(id);

        if (task == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        var canView = await _authService.CanViewTaskAsync(id, userId);

        if (!canView)
            return Forbid();

        return Ok(MapTaskToResponse(task));
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequestDto request)
    {
        if (!HttpContext.Items.TryGetValue("UserId", out var userIdObj) || userIdObj == null)
        {
            if (HttpContext.Items.TryGetValue("UserSyncError", out var errorObj))
            {
                return StatusCode(500, new { error = "User sync failed: " + errorObj });
            }
            return Unauthorized(new { error = "User context not available" });
        }

        if (!int.TryParse(userIdObj.ToString(), out var userId) || userId == 0)
        {
            return BadRequest(new { error = "Invalid user ID" });
        }

        var canCreate = await _authService.CanCreateTaskAsync(request.FamilyId, userId);
        if (!canCreate)
            return Forbid();

        var task = new Entities.Task
        {
            FamilyId = request.FamilyId,
            Title = request.Title,
            Description = request.Description,
            DescriptionJson = request.DescriptionJson,
            DescriptionHtml = request.DescriptionHtml,
            CreatedByUserId = userId,
            AssignedToUserId = request.AssignedToUserId ?? userId,
            Category = request.Category,
            Priority = request.Priority,
            DueDate = request.DueDate?.ToUniversalTime(),
            EstimatedMinutes = request.EstimatedMinutes,
            IsRecurring = request.IsRecurring,
            RecurrencePattern = request.RecurrencePattern,
            LastEditedAt = DateTime.UtcNow,
            LastEditedByUserId = userId,
        };

        var created = await _taskService.CreateAsync(task);
        _logger.LogInformation(
            "Task {TaskId} created by user {UserId} in family {FamilyId}",
            created.TaskId,
            userId,
            request.FamilyId
        );

        return CreatedAtAction(
            nameof(GetTask),
            new { id = created.TaskId },
            MapTaskToResponse(created)
        );
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskRequestDto request)
    {
        var task = await _taskService.GetByIdAsync(id);

        if (task == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        var canEdit = await _authService.CanEditTaskAsync(id, userId);

        if (!canEdit)
            return Forbid();

        task.Title = request.Title;
        task.Description = request.Description;
        task.DescriptionJson = request.DescriptionJson;
        task.DescriptionHtml = request.DescriptionHtml;
        task.Category = request.Category;
        task.Priority = request.Priority;
        task.Status = request.Status;
        task.DueDate = request.DueDate?.ToUniversalTime();
        task.EstimatedMinutes = request.EstimatedMinutes;
        task.IsRecurring = request.IsRecurring;
        task.RecurrencePattern = request.RecurrencePattern;
        task.CompletedAt = request.CompletedAt;

        var updated = await _taskService.UpdateAsync(task, userId);
        _logger.LogInformation("Task {TaskId} updated by user {UserId}", id, userId);

        return Ok(MapTaskToResponse(updated));
    }

    [HttpPost("{id}/assign")]
    public async Task<IActionResult> AssignTask(int id, [FromBody] AssignTaskRequestDto request)
    {
        var task = await _taskService.GetByIdAsync(id);

        if (task == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        var canAssign = await _authService.CanAssignTaskAsync(id, userId);

        if (!canAssign)
            return Forbid();

        if (request.AssignedToUserId.HasValue && request.AssignedToUserId.Value > 0)
        {
            if (!await _familyService.IsMemberAsync(task.FamilyId, request.AssignedToUserId.Value))
                return BadRequest("Assigned user is not a member of this family");
        }

        var assigned = await _taskService.AssignTaskAsync(id, request.AssignedToUserId, userId);
        _logger.LogInformation(
            "Task {TaskId} assigned to user {AssignedToUserId} by {UserId}",
            id,
            request.AssignedToUserId,
            userId
        );

        return Ok(MapTaskToResponse(assigned));
    }

    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompleteTask(int id)
    {
        var task = await _taskService.GetByIdAsync(id);

        if (task == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        var canView = await _authService.CanViewTaskAsync(id, userId);

        if (!canView)
            return Forbid();

        var completed = await _taskService.CompleteTaskAsync(id, userId);
        _logger.LogInformation("Task {TaskId} completed by user {UserId}", id, userId);

        return Ok(MapTaskToResponse(completed));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var task = await _taskService.GetByIdAsync(id);

        if (task == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        var canDelete = await _authService.CanDeleteTaskAsync(id, userId);

        if (!canDelete)
            return Forbid();

        await _taskService.DeleteAsync(id);
        _logger.LogInformation("Task {TaskId} deleted by user {UserId}", id, userId);

        return NoContent();
    }

    [HttpPost("delete-bulk")]
    public async Task<IActionResult> DeleteBulkTasks([FromBody] DeleteBulkTasksRequest request)
    {
        var userId = (int)HttpContext.Items["UserId"]!;

        foreach (var taskId in request.Ids)
        {
            var canDelete = await _authService.CanDeleteTaskAsync(taskId, userId);
            if (!canDelete)
                return Forbid();
        }

        await _taskService.DeleteBulkAsync(request.Ids);
        _logger.LogInformation(
            "Bulk deleted {Count} tasks by user {UserId}",
            request.Ids.Count,
            userId
        );

        return NoContent();
    }

    [HttpDelete("family/{familyId}")]
    public async Task<IActionResult> DeleteFamilyTasks(int familyId)
    {
        var userId = (int)HttpContext.Items["UserId"]!;
        var isAdmin = await _authService.IsUserAdminAsync(userId);
        var isManager = await _authService.IsFamilyManagerAsync(familyId, userId);

        if (!isAdmin && !isManager)
            return Forbid();

        await _taskService.DeleteByFamilyAsync(familyId);
        _logger.LogInformation(
            "All tasks deleted for family {FamilyId} by user {UserId}",
            familyId,
            userId
        );

        return NoContent();
    }

    private TaskResponseDto MapTaskToResponse(Entities.Task task)
    {
        return new TaskResponseDto
        {
            TaskId = task.TaskId,
            FamilyId = task.FamilyId,
            Title = task.Title,
            Description = task.Description,
            DescriptionJson = task.DescriptionJson,
            DescriptionHtml = task.DescriptionHtml,
            Category = task.Category,
            Priority = task.Priority,
            Status = task.Status,
            DueDate = task.DueDate,
            EstimatedMinutes = task.EstimatedMinutes,
            IsRecurring = task.IsRecurring,
            RecurrencePattern = task.RecurrencePattern,
            CompletedAt = task.CompletedAt,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            CreatedBy =
                task.CreatedBy != null
                    ? new UserDisplayDto
                    {
                        UserId = task.CreatedBy.UserId,
                        Email = task.CreatedBy.Email,
                        DisplayName = task.CreatedBy.DisplayName,
                    }
                    : new(),
            AssignedTo =
                task.AssignedTo != null
                    ? new UserDisplayDto
                    {
                        UserId = task.AssignedTo.UserId,
                        Email = task.AssignedTo.Email,
                        DisplayName = task.AssignedTo.DisplayName,
                    }
                    : null,
            AssignedBy =
                task.AssignedBy != null
                    ? new UserDisplayDto
                    {
                        UserId = task.AssignedBy.UserId,
                        Email = task.AssignedBy.Email,
                        DisplayName = task.AssignedBy.DisplayName,
                    }
                    : null,
            AssignedAt = task.AssignedAt,
            LastEditedBy =
                task.LastEditedBy != null
                    ? new UserDisplayDto
                    {
                        UserId = task.LastEditedBy.UserId,
                        Email = task.LastEditedBy.Email,
                        DisplayName = task.LastEditedBy.DisplayName,
                    }
                    : null,
            LastEditedAt = task.LastEditedAt,
        };
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
