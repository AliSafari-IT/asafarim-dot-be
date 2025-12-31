namespace SmartPath.Api.Entities;

public class StreakEntity
{
    public int Id { get; set; }
    public int ChildUserId { get; set; }
    public int CurrentDays { get; set; }
    public int BestDays { get; set; }
    public DateTime LastActivityDate { get; set; }

    public virtual User? Child { get; set; }
}
