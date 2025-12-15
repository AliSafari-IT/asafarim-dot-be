using System.Text.Json;
using KidCode.Api.Data;
using KidCode.Api.DTOs;
using KidCode.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace KidCode.Api.Services;

public class ProgressService : IProgressService
{
    private readonly KidCodeDbContext _db;

    public ProgressService(KidCodeDbContext db)
    {
        _db = db;
    }

    public async Task<ProgressDto> GetProgressAsync(string userId)
    {
        var progress = await _db.Progresses.FirstOrDefaultAsync(p => p.UserId == userId);

        if (progress == null)
        {
            progress = ProgressMapper.ToEntity(userId);
            _db.Progresses.Add(progress);
            await _db.SaveChangesAsync();
        }

        return progress.ToDto();
    }

    public async Task<ProgressDto> UpdateProgressAsync(string userId, UpdateProgressDto dto)
    {
        var progress = await _db.Progresses.FirstOrDefaultAsync(p => p.UserId == userId);

        if (progress == null)
        {
            progress = ProgressMapper.ToEntity(userId);
            _db.Progresses.Add(progress);
        }

        if (dto.UnlockLevel.HasValue)
        {
            var levels =
                JsonSerializer.Deserialize<List<int>>(progress.UnlockedLevelsJson) ?? new() { 1 };
            if (!levels.Contains(dto.UnlockLevel.Value))
            {
                levels.Add(dto.UnlockLevel.Value);
                levels.Sort();
                progress.UnlockedLevelsJson = JsonSerializer.Serialize(levels);
            }
        }

        if (!string.IsNullOrEmpty(dto.AddBadge))
        {
            var badges = JsonSerializer.Deserialize<List<string>>(progress.BadgesJson) ?? new();
            if (!badges.Contains(dto.AddBadge))
            {
                badges.Add(dto.AddBadge);
                progress.BadgesJson = JsonSerializer.Serialize(badges);
            }
        }

        if (!string.IsNullOrEmpty(dto.CompleteChallenge))
        {
            var challenges =
                JsonSerializer.Deserialize<List<string>>(progress.CompletedChallengesJson) ?? new();
            if (!challenges.Contains(dto.CompleteChallenge))
            {
                challenges.Add(dto.CompleteChallenge);
                progress.CompletedChallengesJson = JsonSerializer.Serialize(challenges);
            }
        }

        if (!string.IsNullOrEmpty(dto.EarnSticker))
        {
            var stickers =
                JsonSerializer.Deserialize<List<string>>(progress.EarnedStickersJson) ?? new();
            if (!stickers.Contains(dto.EarnSticker))
            {
                stickers.Add(dto.EarnSticker);
                progress.EarnedStickersJson = JsonSerializer.Serialize(stickers);
            }
        }

        if (dto.AddStickers.HasValue)
        {
            progress.TotalStickers += dto.AddStickers.Value;
        }

        // Handle mode-specific updates
        if (!string.IsNullOrEmpty(dto.Mode))
        {
            var modeProgressJson = dto.Mode.ToLower() switch
            {
                "drawing" => progress.DrawingProgressJson,
                "story" => progress.StoryProgressJson,
                "music" => progress.MusicProgressJson,
                "puzzle" => progress.PuzzleProgressJson,
                _ => null,
            };

            var modeProgress = string.IsNullOrEmpty(modeProgressJson)
                ? new ModeProgress()
                : JsonSerializer.Deserialize<ModeProgress>(modeProgressJson) ?? new ModeProgress();

            if (dto.SetModeLevel.HasValue)
            {
                modeProgress.Level = dto.SetModeLevel.Value;
            }

            if (
                !string.IsNullOrEmpty(dto.AddModeSticker)
                && !modeProgress.Stickers.Contains(dto.AddModeSticker)
            )
            {
                modeProgress.Stickers.Add(dto.AddModeSticker);
            }

            if (
                !string.IsNullOrEmpty(dto.AddModeBadge)
                && !modeProgress.Badges.Contains(dto.AddModeBadge)
            )
            {
                modeProgress.Badges.Add(dto.AddModeBadge);
            }

            if (
                !string.IsNullOrEmpty(dto.CompleteModeChallenge)
                && !modeProgress.CompletedChallenges.Contains(dto.CompleteModeChallenge)
            )
            {
                modeProgress.CompletedChallenges.Add(dto.CompleteModeChallenge);
            }

            var updatedJson = JsonSerializer.Serialize(modeProgress);
            switch (dto.Mode.ToLower())
            {
                case "drawing":
                    progress.DrawingProgressJson = updatedJson;
                    break;
                case "story":
                    progress.StoryProgressJson = updatedJson;
                    break;
                case "music":
                    progress.MusicProgressJson = updatedJson;
                    break;
                case "puzzle":
                    progress.PuzzleProgressJson = updatedJson;
                    break;
            }
        }

        progress.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return progress.ToDto();
    }

    public async Task<List<LeaderboardEntryDto>> GetLeaderboardAsync(string mode, int limit = 10)
    {
        var allProgress = await _db.Progresses.ToListAsync();

        var leaderboardEntries = allProgress
            .Where(p => p.UserId != "guest")
            .Select(p =>
            {
                var modeProgressJson = mode.ToLower() switch
                {
                    "drawing" => p.DrawingProgressJson,
                    "story" => p.StoryProgressJson,
                    "music" => p.MusicProgressJson,
                    "puzzle" => p.PuzzleProgressJson,
                    _ => null,
                };

                if (modeProgressJson == null)
                    return null;

                try
                {
                    var modeProgress = JsonSerializer.Deserialize<ModeProgress>(modeProgressJson);
                    if (modeProgress == null)
                        return null;

                    return new LeaderboardEntryDto
                    {
                        UserId = p.UserId,
                        Username = p.UserId,
                        Level = modeProgress.Level,
                        Score = modeProgress.Stickers.Count * 10 + modeProgress.Level * 5,
                        TotalStarsEarned = modeProgress.Badges.Count,
                        GamesPlayed = modeProgress.CompletedChallenges.Count,
                    };
                }
                catch
                {
                    return null;
                }
            })
            .Where(e => e != null)
            .OrderByDescending(e => e.Score)
            .ThenByDescending(e => e.Level)
            .ThenByDescending(e => e.TotalStarsEarned)
            .Take(limit)
            .Select(
                (entry, index) =>
                    new LeaderboardEntryDto
                    {
                        Rank = index + 1,
                        UserId = entry.UserId,
                        Username = entry.Username,
                        Score = entry.Score,
                        Level = entry.Level,
                        TotalStarsEarned = entry.TotalStarsEarned,
                        GamesPlayed = entry.GamesPlayed,
                    }
            )
            .ToList();

        return leaderboardEntries;
    }
}
