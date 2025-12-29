namespace SmartPath.Api.Entities;

public class Streak
{
    public int StreakId { get; set; }
    public int UserId { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public DateTime LastActivityDate { get; set; }
    public bool FreezeAvailable { get; set; } = true;
    public DateTime? LastFreezeUsed { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User? User { get; set; }
}
