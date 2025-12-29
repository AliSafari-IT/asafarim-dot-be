namespace SmartPath.Api.Entities;

public class Chapter
{
    public int ChapterId { get; set; }
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }

    public Course? Course { get; set; }
    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
}
