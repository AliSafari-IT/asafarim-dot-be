using System.Security.Claims;
using KidCode.Api.Data;
using KidCode.Api.DTOs;
using KidCode.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KidCode.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly KidCodeDbContext _context;

    public LeaderboardController(KidCodeDbContext context)
    {
        _context = context;
    }

    private string? GetUserId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
    }

    [HttpGet]
    public async Task<ActionResult<LeaderboardResponseDto>> GetLeaderboard(
        [FromQuery] string mode = "Overall",
        [FromQuery] string period = "AllTime",
        [FromQuery] int limit = 10
    )
    {
        var query = _context.UserStats.AsQueryable();

        var orderBy = mode.ToLower() switch
        {
            "drawing" => query.OrderByDescending(s => s.DrawingHighScore),
            "story" => query.OrderByDescending(s => s.StoryHighScore),
            "puzzle" => query.OrderByDescending(s => s.PuzzleHighScore),
            "music" => query.OrderByDescending(s => s.MusicHighScore),
            _ => query.OrderByDescending(s => s.TotalScore),
        };

        if (period.ToLower() == "week")
        {
            var weekAgo = DateTime.UtcNow.AddDays(-7);
            query = query.Where(s => s.LastPlayedAt >= weekAgo);
        }
        else if (period.ToLower() == "month")
        {
            var monthAgo = DateTime.UtcNow.AddDays(-30);
            query = query.Where(s => s.LastPlayedAt >= monthAgo);
        }

        var topPlayers = await orderBy.Take(limit).ToListAsync();
        var totalPlayers = await _context.UserStats.CountAsync();

        var entries = topPlayers
            .Select(
                (stats, index) =>
                    new LeaderboardEntryDto
                    {
                        Rank = index + 1,
                        UserId = stats.UserId,
                        Username = stats.Username,
                        Score = mode.ToLower() switch
                        {
                            "drawing" => stats.DrawingHighScore,
                            "story" => stats.StoryHighScore,
                            "puzzle" => stats.PuzzleHighScore,
                            "music" => stats.MusicHighScore,
                            _ => stats.TotalScore,
                        },
                        Level = stats.CurrentLevel,
                        TotalStarsEarned = stats.TotalStarsEarned,
                        GamesPlayed = stats.TotalGamesPlayed,
                    }
            )
            .ToList();

        LeaderboardEntryDto? currentUserEntry = null;
        var userId = GetUserId();

        if (!string.IsNullOrEmpty(userId))
        {
            var userStats = await _context.UserStats.FirstOrDefaultAsync(s => s.UserId == userId);
            if (userStats != null)
            {
                var userScore = mode.ToLower() switch
                {
                    "drawing" => userStats.DrawingHighScore,
                    "story" => userStats.StoryHighScore,
                    "puzzle" => userStats.PuzzleHighScore,
                    "music" => userStats.MusicHighScore,
                    _ => userStats.TotalScore,
                };

                var allStats = await orderBy.ToListAsync();
                var rank =
                    allStats.Count(s =>
                    {
                        var score = mode.ToLower() switch
                        {
                            "drawing" => s.DrawingHighScore,
                            "story" => s.StoryHighScore,
                            "puzzle" => s.PuzzleHighScore,
                            "music" => s.MusicHighScore,
                            _ => s.TotalScore,
                        };
                        return score > userScore;
                    }) + 1;

                currentUserEntry = new LeaderboardEntryDto
                {
                    Rank = rank,
                    UserId = userStats.UserId,
                    Username = userStats.Username,
                    Score = userScore,
                    Level = userStats.CurrentLevel,
                    TotalStarsEarned = userStats.TotalStarsEarned,
                    GamesPlayed = userStats.TotalGamesPlayed,
                };
            }
        }

        return Ok(
            new LeaderboardResponseDto
            {
                Mode = mode,
                Period = period,
                Entries = entries,
                TotalPlayers = totalPlayers,
                CurrentUserEntry = currentUserEntry,
            }
        );
    }
}
