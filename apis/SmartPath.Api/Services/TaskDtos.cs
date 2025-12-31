namespace SmartPath.Api.Services;

public class UserDisplayDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
}

public class TaskResponseDto
{
    public int TaskId { get; set; }
    public int FamilyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public int? EstimatedMinutes { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public UserDisplayDto CreatedBy { get; set; } = new();
    public UserDisplayDto? AssignedTo { get; set; }
    public UserDisplayDto? AssignedBy { get; set; }
    public DateTime? AssignedAt { get; set; }
    public UserDisplayDto? LastEditedBy { get; set; }
    public DateTime? LastEditedAt { get; set; }
}

public class CreateTaskRequestDto
{
    public int FamilyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = "Homework";
    public string Priority { get; set; } = "Medium";
    public DateTime? DueDate { get; set; }
    public int? EstimatedMinutes { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
    public int? AssignedToUserId { get; set; }
}

public class UpdateTaskRequestDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public int? EstimatedMinutes { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class AssignTaskRequestDto
{
    public int? AssignedToUserId { get; set; }
}

public class CourseResponseDto
{
    public int CourseId { get; set; }
    public int FamilyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int GradeLevel { get; set; }
    public string? IconUrl { get; set; }
    public string? ColorCode { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public UserDisplayDto CreatedBy { get; set; } = new();
}

public class CreateCourseRequestDto
{
    public int FamilyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int GradeLevel { get; set; }
    public string? IconUrl { get; set; }
    public string? ColorCode { get; set; }
}

public class UpdateCourseRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int GradeLevel { get; set; }
    public string? IconUrl { get; set; }
    public string? ColorCode { get; set; }
    public bool IsActive { get; set; }
}

public class ChapterResponseDto
{
    public int ChapterId { get; set; }
    public int CourseId { get; set; }
    public int FamilyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public UserDisplayDto CreatedBy { get; set; } = new();
}

public class CreateChapterRequestDto
{
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public string? Description { get; set; }
}

public class UpdateChapterRequestDto
{
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public string? Description { get; set; }
}

public class LessonResponseDto
{
    public int LessonId { get; set; }
    public int ChapterId { get; set; }
    public int FamilyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public string? Description { get; set; }
    public string? LearningObjectives { get; set; }
    public int EstimatedMinutes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public UserDisplayDto CreatedBy { get; set; } = new();
}

public class CreateLessonRequestDto
{
    public int ChapterId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public string? Description { get; set; }
    public string? LearningObjectives { get; set; }
    public int EstimatedMinutes { get; set; }
}

public class UpdateLessonRequestDto
{
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public string? Description { get; set; }
    public string? LearningObjectives { get; set; }
    public int EstimatedMinutes { get; set; }
}
