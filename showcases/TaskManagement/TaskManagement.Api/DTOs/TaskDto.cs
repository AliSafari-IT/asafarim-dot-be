using TaskManagement.Api.Models;

namespace TaskManagement.Api.DTOs;

public class TaskDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public WorkTaskStatus Status { get; set; }
    public TaskPriority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<TaskAssignmentDto> Assignments { get; set; } = new();
    public int CommentCount { get; set; }
    public int AttachmentCount { get; set; }
}

public class CreateTaskDto
{
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public WorkTaskStatus Status { get; set; } = WorkTaskStatus.ToDo;
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public DateTime? DueDate { get; set; }
    public List<string> AssignedUserIds { get; set; } = new();
}

public class UpdateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public WorkTaskStatus Status { get; set; }
    public TaskPriority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public List<string> AssignedUserIds { get; set; } = new();
}

public class UpdateTaskStatusDto
{
    public WorkTaskStatus Status { get; set; }
}

public class TaskFilterDto
{
    public WorkTaskStatus? Status { get; set; }
    public TaskPriority? Priority { get; set; }
    public string? SearchTerm { get; set; }
    public DateTime? DueDateFrom { get; set; }
    public DateTime? DueDateTo { get; set; }
    public string? AssignedUserId { get; set; }
    public string SortBy { get; set; } = "created";
    public bool Descending { get; set; } = true;
    public int Skip { get; set; } = 0;
    public int Take { get; set; } = 50;
}

public class TaskAssignmentDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public DateTime AssignedAt { get; set; }
}
