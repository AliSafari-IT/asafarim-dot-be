using System.Text.Json;
using KidCode.Api.Models;

namespace KidCode.Api.DTOs;

public record ModeProgressDto
{
    public int Level { get; init; } = 1;
    public List<string> Stickers { get; init; } = new();
    public List<string> Badges { get; init; } = new();
    public List<string> CompletedChallenges { get; init; } = new();
}

public record ProgressDto
{
    public string UserId { get; init; } = string.Empty;

    // Legacy fields (for backward compatibility)
    public List<int> UnlockedLevels { get; init; } = new() { 1 };
    public List<string> Badges { get; init; } = new();
    public List<string> CompletedChallenges { get; init; } = new();
    public List<string> EarnedStickers { get; init; } = new();
    public int TotalStickers { get; init; }

    // Per-mode progress
    public ModeProgressDto Drawing { get; init; } = new();
    public ModeProgressDto Story { get; init; } = new();
    public ModeProgressDto Music { get; init; } = new();
    public ModeProgressDto Puzzle { get; init; } = new();
}

public record UpdateProgressDto
{
    // Legacy fields (for backward compatibility)
    public int? UnlockLevel { get; init; }
    public string? AddBadge { get; init; }
    public string? CompleteChallenge { get; init; }
    public string? EarnSticker { get; init; }
    public int? AddStickers { get; init; }

    // Mode-specific updates
    public string? Mode { get; init; } // "Drawing", "Story", "Music", "Puzzle"
    public int? SetModeLevel { get; init; }
    public string? AddModeSticker { get; init; }
    public string? AddModeBadge { get; init; }
    public string? CompleteModeChallenge { get; init; }
}

public static class ProgressMapper
{
    private static ModeProgressDto DeserializeModeProgress(string json)
    {
        try
        {
            var modeProgress = JsonSerializer.Deserialize<ModeProgress>(json);
            return new ModeProgressDto
            {
                Level = modeProgress?.Level ?? 1,
                Stickers = modeProgress?.Stickers ?? new(),
                Badges = modeProgress?.Badges ?? new(),
                CompletedChallenges = modeProgress?.CompletedChallenges ?? new(),
            };
        }
        catch
        {
            return new ModeProgressDto();
        }
    }

    public static ProgressDto ToDto(this Progress progress) =>
        new()
        {
            UserId = progress.UserId,
            UnlockedLevels =
                JsonSerializer.Deserialize<List<int>>(progress.UnlockedLevelsJson) ?? new() { 1 },
            Badges = JsonSerializer.Deserialize<List<string>>(progress.BadgesJson) ?? new(),
            CompletedChallenges =
                JsonSerializer.Deserialize<List<string>>(progress.CompletedChallengesJson) ?? new(),
            EarnedStickers =
                JsonSerializer.Deserialize<List<string>>(progress.EarnedStickersJson) ?? new(),
            TotalStickers = progress.TotalStickers,
            Drawing = DeserializeModeProgress(progress.DrawingProgressJson),
            Story = DeserializeModeProgress(progress.StoryProgressJson),
            Music = DeserializeModeProgress(progress.MusicProgressJson),
            Puzzle = DeserializeModeProgress(progress.PuzzleProgressJson),
        };

    public static Progress ToEntity(string userId) =>
        new()
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            UnlockedLevelsJson = "[1]",
            BadgesJson = "[]",
            CompletedChallengesJson = "[]",
            EarnedStickersJson = "[]",
            TotalStickers = 0,
            DrawingProgressJson =
                "{\"Level\":1,\"Stickers\":[],\"Badges\":[],\"CompletedChallenges\":[]}",
            StoryProgressJson =
                "{\"Level\":1,\"Stickers\":[],\"Badges\":[],\"CompletedChallenges\":[]}",
            MusicProgressJson =
                "{\"Level\":1,\"Stickers\":[],\"Badges\":[],\"CompletedChallenges\":[]}",
            PuzzleProgressJson =
                "{\"Level\":1,\"Stickers\":[],\"Badges\":[],\"CompletedChallenges\":[]}",
            UpdatedAt = DateTime.UtcNow,
        };
}
