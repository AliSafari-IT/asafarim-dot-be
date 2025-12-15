namespace KidCode.Api.Models;

public class Progress
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;

    // Legacy fields (kept for backward compatibility)
    public string UnlockedLevelsJson { get; set; } = "[1]";
    public string BadgesJson { get; set; } = "[]";
    public string CompletedChallengesJson { get; set; } = "[]";
    public string EarnedStickersJson { get; set; } = "[]";
    public int TotalStickers { get; set; }

    // Per-mode progress tracking
    public string DrawingProgressJson { get; set; } =
        "{\"Level\":1,\"Stickers\":[],\"Badges\":[],\"CompletedChallenges\":[]}";
    public string StoryProgressJson { get; set; } =
        "{\"Level\":1,\"Stickers\":[],\"Badges\":[],\"CompletedChallenges\":[]}";
    public string MusicProgressJson { get; set; } =
        "{\"Level\":1,\"Stickers\":[],\"Badges\":[],\"CompletedChallenges\":[]}";
    public string PuzzleProgressJson { get; set; } =
        "{\"Level\":1,\"Stickers\":[],\"Badges\":[],\"CompletedChallenges\":[]}";

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
