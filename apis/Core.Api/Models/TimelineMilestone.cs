using System;
using System.ComponentModel.DataAnnotations;
using Core.Api.Models.Common;

namespace Core.Api.Models;

public class TimelineMilestone : BaseEntity
{
    [Required]
    public Guid JobApplicationId { get; set; }

    [Required, MaxLength(100)]
    public string Type { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required, MaxLength(50)]
    public string Status { get; set; } = "pending";

    [MaxLength(2000)]
    public string? Notes { get; set; }

    [MaxLength(1000)]
    public string? Attachments { get; set; } // JSON array of attachment names

    public DateTime? ReminderDate { get; set; }

    [Required]
    public bool IsCompleted { get; set; } = false;

    public DateTime? CompletedDate { get; set; }

    [Required, MaxLength(7)]
    public string Color { get; set; } = "#3b82f6";

    [Required, MaxLength(10)]
    public string Icon { get; set; } = "📄";

    // Navigation property
    public JobApplication JobApplication { get; set; } = null!;
}
