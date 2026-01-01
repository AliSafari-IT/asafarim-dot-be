namespace SmartPath.Api.DTOs;

public class PracticeAttemptReviewDto
{
    public int AttemptId { get; set; }
    public int PracticeItemId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string ExpectedAnswer { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int PointsAwarded { get; set; }
    public string Difficulty { get; set; } = string.Empty;
    public DateTime AttemptedAt { get; set; }
}
