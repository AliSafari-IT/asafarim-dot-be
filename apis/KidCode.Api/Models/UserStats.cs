namespace KidCode.Api.Models;

public class UserStats
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    // Overall stats
    public int TotalScore { get; set; }
    public int TotalGamesPlayed { get; set; }
    public int TotalStarsEarned { get; set; }
    public int CurrentLevel { get; set; } = 1;
    public int ExperiencePoints { get; set; }

    // Per-mode high scores
    public int DrawingHighScore { get; set; }
    public int StoryHighScore { get; set; }
    public int PuzzleHighScore { get; set; }
    public int MusicHighScore { get; set; }

    // Per-mode games played
    public int DrawingGamesPlayed { get; set; }
    public int StoryGamesPlayed { get; set; }
    public int PuzzleGamesPlayed { get; set; }
    public int MusicGamesPlayed { get; set; }

    // Achievements
    public int TotalStickers { get; set; }
    public string BadgesJson { get; set; } = "[]";
    public string UnlockedLevelsJson { get; set; } = "[1]";
    public string CompletedChallengesJson { get; set; } = "[]";

    // Streaks
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public DateTime? LastPlayedAt { get; set; }

    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
