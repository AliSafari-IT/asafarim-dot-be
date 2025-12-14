using System.Text.Json;
using KidCode.Api.Models;

namespace KidCode.Api.DTOs;

public record ProgressDto
{
    public string UserId { get; init; } = string.Empty;
    public List<int> UnlockedLevels { get; init; } = new() { 1 };
    public List<string> Badges { get; init; } = new();
    public List<string> CompletedChallenges { get; init; } = new();
    public int TotalStickers { get; init; }
}

public record UpdateProgressDto
{
    public int? UnlockLevel { get; init; }
    public string? AddBadge { get; init; }
    public string? CompleteChallenge { get; init; }
    public int? AddStickers { get; init; }
}

public static class ProgressMapper
{
    public static ProgressDto ToDto(this Progress progress) =>
        new()
        {
            UserId = progress.UserId,
            UnlockedLevels =
                JsonSerializer.Deserialize<List<int>>(progress.UnlockedLevelsJson) ?? new() { 1 },
            Badges = JsonSerializer.Deserialize<List<string>>(progress.BadgesJson) ?? new(),
            CompletedChallenges =
                JsonSerializer.Deserialize<List<string>>(progress.CompletedChallengesJson) ?? new(),
            TotalStickers = progress.TotalStickers,
        };

    public static Progress ToEntity(string userId) =>
        new()
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            UnlockedLevelsJson = "[1]",
            BadgesJson = "[]",
            CompletedChallengesJson = "[]",
            TotalStickers = 0,
            UpdatedAt = DateTime.UtcNow,
        };
}
