namespace SmartPath.Api.DTOs;

public class CreateLessonRequestDto
{
    public int ChapterId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public string? Description { get; set; }
    public string? LearningObjectives { get; set; }
    public string? DescriptionJson { get; set; }
    public string? DescriptionHtml { get; set; }
    public string? LearningObjectivesJson { get; set; }
    public string? LearningObjectivesHtml { get; set; }
    public int EstimatedMinutes { get; set; }
}

public class UpdateLessonRequestDto
{
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public string? Description { get; set; }
    public string? LearningObjectives { get; set; }
    public string? DescriptionJson { get; set; }
    public string? DescriptionHtml { get; set; }
    public string? LearningObjectivesJson { get; set; }
    public string? LearningObjectivesHtml { get; set; }
    public int EstimatedMinutes { get; set; }
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
    public string? DescriptionJson { get; set; }
    public string? DescriptionHtml { get; set; }
    public string? LearningObjectivesJson { get; set; }
    public string? LearningObjectivesHtml { get; set; }
    public int EstimatedMinutes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public UserDisplayDto CreatedBy { get; set; } = new();
}

public class UserDisplayDto
{
    public int UserId { get; set; }
    public string? Email { get; set; }
    public string? DisplayName { get; set; }
}
