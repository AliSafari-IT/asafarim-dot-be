namespace SmartPath.Api.Entities;

public class PracticeSession
{
    public int Id { get; set; }
    public int FamilyId { get; set; }
    public int ChildUserId { get; set; }
    public int LessonId { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int TotalPoints { get; set; }
    public string Status { get; set; } = "InProgress";

    public virtual Family? Family { get; set; }
    public virtual User? Child { get; set; }
    public virtual Lesson? Lesson { get; set; }
    public virtual ICollection<PracticeAttempt> Attempts { get; set; } = new List<PracticeAttempt>();
}
