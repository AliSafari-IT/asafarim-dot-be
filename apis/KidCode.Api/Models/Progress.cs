namespace KidCode.Api.Models;

public class Progress
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UnlockedLevelsJson { get; set; } = "[1]";
    public string BadgesJson { get; set; } = "[]";
    public string CompletedChallengesJson { get; set; } = "[]";
    public int TotalStickers { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
