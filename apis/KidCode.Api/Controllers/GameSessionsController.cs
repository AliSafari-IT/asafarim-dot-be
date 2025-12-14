using System.Security.Claims;
using System.Text.Json;
using KidCode.Api.Data;
using KidCode.Api.DTOs;
using KidCode.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KidCode.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GameSessionsController : ControllerBase
{
    private readonly KidCodeDbContext _context;
    private readonly ILogger<GameSessionsController> _logger;

    public GameSessionsController(KidCodeDbContext context, ILogger<GameSessionsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private string GetUserId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? throw new UnauthorizedAccessException("User ID not found");
    }

    [HttpPost]
    public async Task<ActionResult<GameSessionResponseDto>> CreateGameSession(
        [FromBody] CreateGameSessionDto dto
    )
    {
        var userId = GetUserId();

        if (!Enum.TryParse<GameMode>(dto.Mode, true, out var gameMode))
        {
            return BadRequest("Invalid game mode");
        }

        var session = new GameSession
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Mode = gameMode,
            Score = dto.Score,
            Level = dto.Level,
            StarsEarned = dto.StarsEarned,
            TimeSpentSeconds = dto.TimeSpentSeconds,
            Completed = dto.Completed,
            MetadataJson = dto.Metadata != null ? JsonSerializer.Serialize(dto.Metadata) : "{}",
            CreatedAt = DateTime.UtcNow,
        };

        _context.GameSessions.Add(session);
        await UpdateUserStats(userId, session);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Game session created: User={UserId}, Mode={Mode}, Score={Score}",
            userId,
            gameMode,
            dto.Score
        );

        return Ok(MapToResponseDto(session));
    }

    [HttpGet]
    public async Task<ActionResult<List<GameSessionResponseDto>>> GetMySessions(
        [FromQuery] string? mode = null,
        [FromQuery] int limit = 20
    )
    {
        var userId = GetUserId();
        var query = _context.GameSessions.Where(s => s.UserId == userId);

        if (!string.IsNullOrEmpty(mode) && Enum.TryParse<GameMode>(mode, true, out var gameMode))
        {
            query = query.Where(s => s.Mode == gameMode);
        }

        var sessions = await query.OrderByDescending(s => s.CreatedAt).Take(limit).ToListAsync();

        return Ok(sessions.Select(MapToResponseDto).ToList());
    }

    private async Task UpdateUserStats(string userId, GameSession session)
    {
        var stats = await _context.UserStats.FirstOrDefaultAsync(s => s.UserId == userId);

        if (stats == null)
        {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? "user@example.com";
            stats = new UserStats
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Username = userEmail.Split('@')[0],
                Email = userEmail,
            };
            _context.UserStats.Add(stats);
        }

        stats.TotalScore += session.Score;
        stats.TotalGamesPlayed++;
        stats.TotalStarsEarned += session.StarsEarned;
        stats.ExperiencePoints += session.Score + (session.StarsEarned * 10);

        switch (session.Mode)
        {
            case GameMode.Drawing:
                stats.DrawingGamesPlayed++;
                if (session.Score > stats.DrawingHighScore)
                    stats.DrawingHighScore = session.Score;
                break;
            case GameMode.Story:
                stats.StoryGamesPlayed++;
                if (session.Score > stats.StoryHighScore)
                    stats.StoryHighScore = session.Score;
                break;
            case GameMode.Puzzle:
                stats.PuzzleGamesPlayed++;
                if (session.Score > stats.PuzzleHighScore)
                    stats.PuzzleHighScore = session.Score;
                break;
            case GameMode.Music:
                stats.MusicGamesPlayed++;
                if (session.Score > stats.MusicHighScore)
                    stats.MusicHighScore = session.Score;
                break;
        }

        var today = DateTime.UtcNow.Date;
        var lastPlayed = stats.LastPlayedAt?.Date;

        if (lastPlayed == today.AddDays(-1))
        {
            stats.CurrentStreak++;
        }
        else if (lastPlayed != today)
        {
            stats.CurrentStreak = 1;
        }

        if (stats.CurrentStreak > stats.LongestStreak)
        {
            stats.LongestStreak = stats.CurrentStreak;
        }

        stats.LastPlayedAt = DateTime.UtcNow;
        stats.UpdatedAt = DateTime.UtcNow;
        stats.CurrentLevel = CalculateLevel(stats.ExperiencePoints);
    }

    private int CalculateLevel(int xp)
    {
        return (int)Math.Floor(Math.Sqrt(xp / 100.0)) + 1;
    }

    private GameSessionResponseDto MapToResponseDto(GameSession session)
    {
        Dictionary<string, object>? metadata = null;
        try
        {
            metadata = JsonSerializer.Deserialize<Dictionary<string, object>>(session.MetadataJson);
        }
        catch
        {
            metadata = new Dictionary<string, object>();
        }

        return new GameSessionResponseDto
        {
            Id = session.Id,
            Mode = session.Mode.ToString(),
            Score = session.Score,
            Level = session.Level,
            StarsEarned = session.StarsEarned,
            TimeSpentSeconds = session.TimeSpentSeconds,
            Completed = session.Completed,
            Metadata = metadata,
            CreatedAt = session.CreatedAt,
        };
    }
}
