namespace SmartPath.Api.DTOs;

public class CreatePracticeSessionRequestDto
{
    public int FamilyId { get; set; }
    public int ChildUserId { get; set; }
    public int LessonId { get; set; }
}

public class PracticeSessionResponseDto
{
    public int Id { get; set; }
    public int ChildUserId { get; set; }
    public int LessonId { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int TotalPoints { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<PracticeAttemptResponseDto> Attempts { get; set; } = new();
}

public class CreatePracticeAttemptRequestDto
{
    public int SessionId { get; set; }
    public int PracticeItemId { get; set; }
    public string Answer { get; set; } = string.Empty;
}

public class PracticeAttemptResponseDto
{
    public int Id { get; set; }
    public int SessionId { get; set; }
    public string Prompt { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int PointsAwarded { get; set; }
    public DateTime AttemptedAt { get; set; }
}

public class ChildPracticeSummaryDto
{
    public int ChildUserId { get; set; }
    public string ChildName { get; set; } = string.Empty;
    public int TotalPoints { get; set; }
    public int MaxPossiblePoints { get; set; }
    public int SessionsCount { get; set; }
    public int AttemptsCount { get; set; }
    public double CorrectRate { get; set; }
    public int CurrentStreak { get; set; }
    public int BestStreak { get; set; }
    public List<UserAchievementDto> RecentAchievements { get; set; } = new();
}

public class FamilyChildrenSummaryDto
{
    public int FamilyId { get; set; }
    public List<ChildPracticeSummaryDto> Children { get; set; } = new();
}

public class AchievementDto
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public int Points { get; set; }
    public bool IsActive { get; set; }
}

public class UserAchievementDto
{
    public int Id { get; set; }
    public int ChildUserId { get; set; }
    public AchievementDto Achievement { get; set; } = new();
    public DateTime AwardedAt { get; set; }
}
