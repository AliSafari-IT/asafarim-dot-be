namespace SmartPath.Api.Entities;

public class Lesson
{
    public int LessonId { get; set; }
    public int ChapterId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public string? Description { get; set; }
    public string? LearningObjectives { get; set; }
    public int EstimatedMinutes { get; set; }
    public DateTime CreatedAt { get; set; }

    public Chapter? Chapter { get; set; }
    public ICollection<PracticeItem> PracticeItems { get; set; } = new List<PracticeItem>();
    public ICollection<LessonProgress> ProgressRecords { get; set; } = new List<LessonProgress>();
}
