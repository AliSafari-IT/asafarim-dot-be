using System;
using System.Collections.Generic;

namespace TaskManagement.Api.Models;

public class TaskProject
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string UserId { get; set; } = string.Empty;
    public bool IsPrivate { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<TaskManagement> Tasks { get; set; } = new List<TaskManagement>();
    public ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();
}
