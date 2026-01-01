namespace SmartPath.Api.DTOs;

public class ProgressSummaryDto
{
    public int TotalSessions { get; set; }
    public int TotalAttempts { get; set; }
    public decimal AccuracyPercentage { get; set; }
    public int CurrentStreak { get; set; }
    public int BestStreak { get; set; }
    public int TotalPoints { get; set; }
}

public class LessonProgressDto
{
    public int LessonId { get; set; }
    public string LessonTitle { get; set; } = string.Empty;
    public int AttemptCount { get; set; }
    public decimal Accuracy { get; set; }
    public DateTime? LastPracticed { get; set; }
    public int PointsEarned { get; set; }
}

public class TimeSeriesDataDto
{
    public DateTime Date { get; set; }
    public int AttemptCount { get; set; }
    public decimal Accuracy { get; set; }
}
