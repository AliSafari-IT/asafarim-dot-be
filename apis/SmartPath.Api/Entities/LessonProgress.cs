namespace SmartPath.Api.Entities;

public class LessonProgress
{
    public int ProgressId { get; set; }
    public int ChildUserId { get; set; }
    public int LessonId { get; set; }
    public string Status { get; set; } = "NotStarted";
    public decimal MasteryLevel { get; set; }
    public int SelfAssessmentScore { get; set; }
    public DateTime? FirstAttemptedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? LastReviewedAt { get; set; }
    public DateTime? NextReviewDate { get; set; }
    public int ReviewCount { get; set; }
    public int TotalTimeSpentMinutes { get; set; }
    public int TotalPracticeAttempts { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User? Child { get; set; }
    public Lesson? Lesson { get; set; }
}
