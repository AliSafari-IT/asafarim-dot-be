namespace KidCode.Api.Models;

public enum GameMode
{
    Drawing,
    Story,
    Puzzle,
    Music,
}

public class GameSession
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public GameMode Mode { get; set; }
    public int Score { get; set; }
    public int Level { get; set; } = 1;
    public int StarsEarned { get; set; }
    public int TimeSpentSeconds { get; set; }
    public bool Completed { get; set; }
    public string MetadataJson { get; set; } = "{}";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
