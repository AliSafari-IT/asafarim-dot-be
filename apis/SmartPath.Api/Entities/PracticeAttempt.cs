namespace SmartPath.Api.Entities;

public class PracticeAttempt
{
    public int AttemptId { get; set; }
    public int? PracticeSessionId { get; set; }
    public int ChildUserId { get; set; }
    public int PracticeItemId { get; set; }
    public int LessonId { get; set; }
    public string? Answer { get; set; }
    public bool IsCorrect { get; set; }
    public int PointsAwarded { get; set; }
    public int TimeSpentSeconds { get; set; }
    public int HintsUsed { get; set; }
    public int? SelfRating { get; set; }
    public DateTime AttemptedAt { get; set; }

    public User? Child { get; set; }
    public PracticeItem? PracticeItem { get; set; }
    public PracticeSession? PracticeSession { get; set; }
}
