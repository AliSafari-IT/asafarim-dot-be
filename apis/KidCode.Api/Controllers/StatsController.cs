using System.Security.Claims;
using System.Text.Json;
using KidCode.Api.Data;
using KidCode.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KidCode.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly KidCodeDbContext _context;

    public StatsController(KidCodeDbContext context)
    {
        _context = context;
    }

    private string? GetUserId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<UserStatsDto>> GetMyStats()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var stats = await _context.UserStats.FirstOrDefaultAsync(s => s.UserId == userId);

        if (stats == null)
        {
            return Ok(new UserStatsDto { UserId = userId });
        }

        return Ok(MapToDto(stats));
    }

    [HttpGet("{userId}")]
    public async Task<ActionResult<UserStatsDto>> GetUserStats(string userId)
    {
        var stats = await _context.UserStats.FirstOrDefaultAsync(s => s.UserId == userId);

        if (stats == null)
        {
            return NotFound();
        }

        return Ok(MapToDto(stats));
    }

    private UserStatsDto MapToDto(Models.UserStats stats)
    {
        return new UserStatsDto
        {
            UserId = stats.UserId,
            Username = stats.Username,
            TotalScore = stats.TotalScore,
            TotalGamesPlayed = stats.TotalGamesPlayed,
            TotalStarsEarned = stats.TotalStarsEarned,
            CurrentLevel = stats.CurrentLevel,
            ExperiencePoints = stats.ExperiencePoints,
            HighScores = new Dictionary<string, int>
            {
                ["Drawing"] = stats.DrawingHighScore,
                ["Story"] = stats.StoryHighScore,
                ["Puzzle"] = stats.PuzzleHighScore,
                ["Music"] = stats.MusicHighScore,
            },
            GamesPlayed = new Dictionary<string, int>
            {
                ["Drawing"] = stats.DrawingGamesPlayed,
                ["Story"] = stats.StoryGamesPlayed,
                ["Puzzle"] = stats.PuzzleGamesPlayed,
                ["Music"] = stats.MusicGamesPlayed,
            },
            TotalStickers = stats.TotalStickers,
            Badges = JsonSerializer.Deserialize<List<string>>(stats.BadgesJson) ?? new(),
            UnlockedLevels =
                JsonSerializer.Deserialize<List<int>>(stats.UnlockedLevelsJson) ?? new(),
            CurrentStreak = stats.CurrentStreak,
            LongestStreak = stats.LongestStreak,
            LastPlayedAt = stats.LastPlayedAt,
        };
    }
}
