namespace KidCode.Api.DTOs;

public class CreateGameSessionDto
{
    public string Mode { get; set; } = string.Empty;
    public int Score { get; set; }
    public int Level { get; set; } = 1;
    public int StarsEarned { get; set; }
    public int TimeSpentSeconds { get; set; }
    public bool Completed { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}

public class GameSessionResponseDto
{
    public Guid Id { get; set; }
    public string Mode { get; set; } = string.Empty;
    public int Score { get; set; }
    public int Level { get; set; }
    public int StarsEarned { get; set; }
    public int TimeSpentSeconds { get; set; }
    public bool Completed { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UserStatsDto
{
    public string UserId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public int TotalScore { get; set; }
    public int TotalGamesPlayed { get; set; }
    public int TotalStarsEarned { get; set; }
    public int CurrentLevel { get; set; }
    public int ExperiencePoints { get; set; }

    public Dictionary<string, int> HighScores { get; set; } = new();
    public Dictionary<string, int> GamesPlayed { get; set; } = new();

    public int TotalStickers { get; set; }
    public List<string> Badges { get; set; } = new();
    public List<int> UnlockedLevels { get; set; } = new();

    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public DateTime? LastPlayedAt { get; set; }
}

public class LeaderboardEntryDto
{
    public int Rank { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public int Score { get; set; }
    public int Level { get; set; }
    public int TotalStarsEarned { get; set; }
    public int GamesPlayed { get; set; }
}

public class LeaderboardResponseDto
{
    public string Mode { get; set; } = "Overall";
    public string Period { get; set; } = "AllTime";
    public List<LeaderboardEntryDto> Entries { get; set; } = new();
    public int TotalPlayers { get; set; }
    public LeaderboardEntryDto? CurrentUserEntry { get; set; }
}
