namespace SmartPath.Api.Entities;

public class UserAchievement
{
    public int UserAchievementId { get; set; }
    public int UserId { get; set; }
    public int AchievementId { get; set; }
    public DateTime EarnedAt { get; set; }

    public User? User { get; set; }
    public Achievement? Achievement { get; set; }
}
