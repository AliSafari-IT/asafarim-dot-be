namespace SmartPath.Api.DTOs;

public class PracticeSessionReviewDto
{
    public int Id { get; set; }
    public int FamilyId { get; set; }
    public int ChildUserId { get; set; }
    public int LessonId { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int TotalPoints { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<PracticeAttemptReviewDto> Attempts { get; set; } = new();
}
