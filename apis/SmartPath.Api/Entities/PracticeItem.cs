namespace SmartPath.Api.Entities;

public class PracticeItem
{
    public int PracticeItemId { get; set; }
    public int LessonId { get; set; }
    public int CreatedByUserId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string ExpectedAnswer { get; set; } = string.Empty;
    public int Points { get; set; }
    public string Difficulty { get; set; } = "Medium";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Lesson? Lesson { get; set; }
    public User? CreatedBy { get; set; }
    public ICollection<PracticeAttempt> Attempts { get; set; } = new List<PracticeAttempt>();
}
