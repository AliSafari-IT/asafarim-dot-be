namespace TaskManagement.Api.Models;

public class TaskAssignment
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime AssignedAt { get; set; }

    // Navigation properties
    public TaskManagement? Task { get; set; }
}
