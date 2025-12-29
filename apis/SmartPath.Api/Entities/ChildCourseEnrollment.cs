namespace SmartPath.Api.Entities;

public class ChildCourseEnrollment
{
    public int EnrollmentId { get; set; }
    public int ChildUserId { get; set; }
    public int CourseId { get; set; }
    public int? CurrentChapterId { get; set; }
    public int? CurrentLessonId { get; set; }
    public decimal OverallProgress { get; set; }
    public decimal AverageMastery { get; set; }
    public int TotalLessonsCompleted { get; set; }
    public int TotalTimeSpentMinutes { get; set; }
    public DateTime EnrolledAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User? Child { get; set; }
    public Course? Course { get; set; }
}
