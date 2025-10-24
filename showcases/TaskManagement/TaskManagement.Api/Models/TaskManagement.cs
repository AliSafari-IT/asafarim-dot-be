namespace TaskManagement.Api.Models;

public class TaskManagement
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public WorkTaskStatus Status { get; set; } = WorkTaskStatus.ToDo;
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public DateTime? DueDate { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public TaskProject? Project { get; set; }
    public ICollection<TaskAssignment> Assignments { get; set; } = new List<TaskAssignment>();
    public ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
    public ICollection<TaskAttachment> Attachments { get; set; } = new List<TaskAttachment>();
}
