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

        if (dto.AddStickers.HasValue)
        {
            progress.TotalStickers += dto.AddStickers.Value;
        }

        progress.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return progress.ToDto();
    }
}
