using KidCode.Api.Models;

namespace KidCode.Api.DTOs;

public record ChallengeDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Mode { get; init; } = "drawing";
    public string Prompt { get; init; } = string.Empty;
    public string? StarterBlocksJson { get; init; }
    public string? SuccessCriteria { get; init; }
    public int Level { get; init; }
    public string? RewardSticker { get; init; }
    public bool IsDaily { get; init; }
}

public static class ChallengeMapper
{
    public static ChallengeDto ToDto(this Challenge challenge) =>
        new()
        {
            Id = challenge.Id,
            Title = challenge.Title,
            Mode = challenge.Mode.ToString().ToLower(),
            Prompt = challenge.Prompt,
            StarterBlocksJson = challenge.StarterBlocksJson,
            SuccessCriteria = challenge.SuccessCriteria,
            Level = challenge.Level,
            RewardSticker = challenge.RewardSticker,
            IsDaily = challenge.IsDaily,
        };
}
