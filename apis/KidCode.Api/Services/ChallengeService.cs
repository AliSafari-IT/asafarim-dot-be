using KidCode.Api.Data;
using KidCode.Api.DTOs;
using KidCode.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace KidCode.Api.Services;

public class ChallengeService : IChallengeService
{
    private readonly KidCodeDbContext _db;

    public ChallengeService(KidCodeDbContext db)
    {
        _db = db;
    }

    public async Task<List<ChallengeDto>> GetChallengesAsync(string? mode = null, int? level = null)
    {
        var query = _db.Challenges.AsQueryable();

        if (
            !string.IsNullOrEmpty(mode)
            && Enum.TryParse<ProjectMode>(mode, true, out var projectMode)
        )
        {
            query = query.Where(c => c.Mode == projectMode);
        }

        if (level.HasValue)
        {
            query = query.Where(c => c.Level == level.Value);
        }

        return await query
            .OrderBy(c => c.Level)
            .ThenBy(c => c.Title)
            .Select(c => c.ToDto())
            .ToListAsync();
    }

    public async Task<ChallengeDto?> GetDailyChallengeAsync()
    {
        var today = DateTime.UtcNow.DayOfYear;
        var challenges = await _db.Challenges.ToListAsync();

        if (!challenges.Any())
            return null;

        var index = today % challenges.Count;
        return challenges[index].ToDto();
    }
}
