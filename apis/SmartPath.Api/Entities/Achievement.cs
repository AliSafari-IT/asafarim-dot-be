namespace SmartPath.Api.Entities;

public class Achievement
{
    public int AchievementId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public string Category { get; set; } = "Learning";
    public string? Requirement { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<UserAchievement> UserAchievements { get; set; } =
        new List<UserAchievement>();
}
