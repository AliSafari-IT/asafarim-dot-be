namespace SmartPath.Api.Entities;

public class Task
{
    public int TaskId { get; set; }
    public int FamilyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? DescriptionJson { get; set; }
    public string? DescriptionHtml { get; set; }
    public int? AssignedToUserId { get; set; }
    public int? AssignedByUserId { get; set; }
    public DateTime? AssignedAt { get; set; }
    public int CreatedByUserId { get; set; }
    public int? LastEditedByUserId { get; set; }
    public DateTime? LastEditedAt { get; set; }
    public string Category { get; set; } = "Homework";
    public string Priority { get; set; } = "Medium";
    public string Status { get; set; } = "Pending";
    public DateTime? DueDate { get; set; }
    public int? EstimatedMinutes { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Family? Family { get; set; }
    public User? AssignedTo { get; set; }
    public User? AssignedBy { get; set; }
    public User? CreatedBy { get; set; }
    public User? LastEditedBy { get; set; }
    public ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
}
