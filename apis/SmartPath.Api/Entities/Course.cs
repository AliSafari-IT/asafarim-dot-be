namespace SmartPath.Api.Entities;

public class Course
{
    public int CourseId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int GradeLevel { get; set; }
    public string? IconUrl { get; set; }
    public string? ColorCode { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    public ICollection<Chapter> Chapters { get; set; } = new List<Chapter>();
    public ICollection<ChildCourseEnrollment> Enrollments { get; set; } =
        new List<ChildCourseEnrollment>();
}
