using System;

namespace Core.Api.Models;

public class TimelineMilestoneDto
{
    public Guid Id { get; set; }
    public Guid JobApplicationId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public string Status { get; set; } = "pending";
    public string? Notes { get; set; }
    public string? Attachments { get; set; }
    public DateTime? ReminderDate { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedDate { get; set; }
    public string Color { get; set; } = "#3b82f6";
    public string Icon { get; set; } = "📄";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateTimelineMilestoneDto
{
    public Guid JobApplicationId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public string Status { get; set; } = "pending";
    public string? Notes { get; set; }
    public string? Attachments { get; set; }
    public DateTime? ReminderDate { get; set; }
    public string Color { get; set; } = "#3b82f6";
    public string Icon { get; set; } = "📄";
}

public class UpdateTimelineMilestoneDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public string Status { get; set; } = "pending";
    public string? Notes { get; set; }
    public string? Attachments { get; set; }
    public DateTime? ReminderDate { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedDate { get; set; }
}
