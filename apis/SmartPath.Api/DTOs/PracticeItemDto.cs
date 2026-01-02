namespace SmartPath.Api.DTOs;

public class PracticeItemDto
{
    public int Id { get; set; }
    public int LessonId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string? QuestionJson { get; set; }
    public string? QuestionHtml { get; set; }
    public int Points { get; set; }
    public string Difficulty { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreatePracticeItemDto
{
    public int LessonId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string? QuestionJson { get; set; }
    public string? QuestionHtml { get; set; }
    public string ExpectedAnswer { get; set; } = string.Empty;
    public string? ExpectedAnswerJson { get; set; }
    public string? ExpectedAnswerHtml { get; set; }
    public int Points { get; set; }
    public string Difficulty { get; set; } = "Medium";
}

public class UpdatePracticeItemDto
{
    public string QuestionText { get; set; } = string.Empty;
    public string? QuestionJson { get; set; }
    public string? QuestionHtml { get; set; }
    public string ExpectedAnswer { get; set; } = string.Empty;
    public string? ExpectedAnswerJson { get; set; }
    public string? ExpectedAnswerHtml { get; set; }
    public int Points { get; set; }
    public string Difficulty { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class PracticeDashboardDto
{
    public List<ChildDashboardDto> Children { get; set; } = new();
}

public class ChildDashboardDto
{
    public int ChildUserId { get; set; }
    public string ChildName { get; set; } = string.Empty;
    public int TotalPoints { get; set; }
    public int CurrentStreak { get; set; }
    public double Accuracy { get; set; }
    public List<AttemptSummaryDto> RecentAttempts { get; set; } = new();
    public List<WeakLessonDto> WeakLessons { get; set; } = new();
}

public class AttemptSummaryDto
{
    public int AttemptId { get; set; }
    public string QuestionPreview { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int PointsAwarded { get; set; }
    public int LessonId { get; set; }
    public string LessonTitle { get; set; } = string.Empty;
    public DateTime AttemptedAt { get; set; }
}

public class WeakLessonDto
{
    public int LessonId { get; set; }
    public string LessonTitle { get; set; } = string.Empty;
    public double Accuracy { get; set; }
    public int AttemptCount { get; set; }
}

public class PracticeItemResponseDto
{
    public int PracticeItemId { get; set; }
    public int LessonId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string? QuestionJson { get; set; }
    public string? QuestionHtml { get; set; }
    public string ExpectedAnswer { get; set; } = string.Empty;
    public string? ExpectedAnswerJson { get; set; }
    public string? ExpectedAnswerHtml { get; set; }
    public int Points { get; set; }
    public string Difficulty { get; set; } = "Medium";
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
