namespace SmartPath.Api.Entities;

public class Lesson
{
    public int LessonId { get; set; }
    public int ChapterId { get; set; }
    public int FamilyId { get; set; }
    public int CreatedByUserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public string? Description { get; set; }
    public string? LearningObjectives { get; set; }
    public string? DescriptionJson { get; set; }
    public string? DescriptionHtml { get; set; }
    public string? LearningObjectivesJson { get; set; }
    public string? LearningObjectivesHtml { get; set; }
    public int EstimatedMinutes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Chapter? Chapter { get; set; }
    public Family? Family { get; set; }
    public User? CreatedBy { get; set; }
    public ICollection<PracticeItem> PracticeItems { get; set; } = new List<PracticeItem>();
    public ICollection<LessonProgress> ProgressRecords { get; set; } = new List<LessonProgress>();
}
