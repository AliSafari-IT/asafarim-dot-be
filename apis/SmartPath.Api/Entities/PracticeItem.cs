namespace SmartPath.Api.Entities;

public class PracticeItem
{
    public int PracticeItemId { get; set; }
    public int LessonId { get; set; }
    public int CreatedByUserId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string? QuestionJson { get; set; }
    public string? QuestionHtml { get; set; }
    public string ExpectedAnswer { get; set; } = string.Empty;
    public string? ExpectedAnswerJson { get; set; }
    public string? ExpectedAnswerHtml { get; set; }
    public int Points { get; set; }
    public string Difficulty { get; set; } = "Medium";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Lesson? Lesson { get; set; }
    public User? CreatedBy { get; set; }
    public ICollection<PracticeAttempt> Attempts { get; set; } = new List<PracticeAttempt>();
}
