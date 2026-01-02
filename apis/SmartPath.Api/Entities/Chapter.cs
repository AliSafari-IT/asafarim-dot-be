namespace SmartPath.Api.Entities;

public class Chapter
{
    public int ChapterId { get; set; }
    public int CourseId { get; set; }
    public int FamilyId { get; set; }
    public int CreatedByUserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public string? Description { get; set; }
    public string? DescriptionJson { get; set; }
    public string? DescriptionHtml { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Course? Course { get; set; }
    public Family? Family { get; set; }
    public User? CreatedBy { get; set; }
    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
}
