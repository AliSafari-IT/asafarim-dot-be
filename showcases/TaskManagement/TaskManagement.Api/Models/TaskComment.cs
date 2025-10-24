using System;

namespace TaskManagement.Api.Models;

public class TaskComment
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public TaskManagement? Task { get; set; }
}
