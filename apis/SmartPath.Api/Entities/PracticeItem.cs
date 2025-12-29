namespace SmartPath.Api.Entities;

public class PracticeItem
{
    public int PracticeItemId { get; set; }
    public int LessonId { get; set; }
    public string Type { get; set; } = "MultipleChoice";
    public string QuestionText { get; set; } = string.Empty;
    public string? CorrectAnswer { get; set; }
    public string? AnswerChoices { get; set; }
    public string Difficulty { get; set; } = "Medium";
    public string? Hints { get; set; }
    public string? ExplanationText { get; set; }
    public int TimeEstimateSeconds { get; set; }
    public DateTime CreatedAt { get; set; }

    public Lesson? Lesson { get; set; }
    public ICollection<PracticeAttempt> Attempts { get; set; } = new List<PracticeAttempt>();
}
