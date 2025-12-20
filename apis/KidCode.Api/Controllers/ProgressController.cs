using System.Security.Claims;
using KidCode.Api.Data;
using KidCode.Api.Models;
using KidCode.Api.DTOs;
using KidCode.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KidCode.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProgressController : ControllerBase
{
    private readonly IProgressService _progressService;
    private readonly KidCodeDbContext _db;

    public ProgressController(IProgressService progressService, KidCodeDbContext db)
    {
        _progressService = progressService;
        _db = db;
    }

    private string GetUserId()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        return string.IsNullOrWhiteSpace(userId) ? "guest" : userId;
    }

    private static string? GetClaimValue(ClaimsPrincipal user, params string[] claimTypes)
    {
        foreach (var claimType in claimTypes)
        {
            var value = user.FindFirst(claimType)?.Value;
            if (!string.IsNullOrWhiteSpace(value))
                return value;
        }

        return null;
    }

    private async Task EnsureUserStatsAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId) || userId == "guest")
            return;

        var email = GetClaimValue(User, ClaimTypes.Email, "email");
        var username = GetClaimValue(User, ClaimTypes.Name, "name", "preferred_username", "userName");

        if (string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(email))
        {
            var atIndex = email.IndexOf('@');
            username = atIndex > 0 ? email[..atIndex] : email;
        }

        var existing = await _db.UserStats.FirstOrDefaultAsync(s => s.UserId == userId);
        if (existing == null)
        {
            existing = new UserStats
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Username = username ?? "Player",
                Email = email ?? "",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            _db.UserStats.Add(existing);
            await _db.SaveChangesAsync();
            return;
        }

        var changed = false;

        if (!string.IsNullOrWhiteSpace(username) && existing.Username != username)
        {
            existing.Username = username;
            changed = true;
        }

        if (!string.IsNullOrWhiteSpace(email) && existing.Email != email)
        {
            existing.Email = email;
            changed = true;
        }

        if (changed)
        {
            existing.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    [HttpGet]
    public async Task<ActionResult<ProgressDto>> GetProgress()
    {
        var userId = GetUserId();
        await EnsureUserStatsAsync(userId);
        var progress = await _progressService.GetProgressAsync(userId);
        return Ok(progress);
    }

    [HttpGet("{userId}")]
    public async Task<ActionResult<ProgressDto>> GetUserProgress(string userId)
    {
        var progress = await _progressService.GetProgressAsync(userId);
        return Ok(progress);
    }

    [HttpPost("update")]
    public async Task<ActionResult<ProgressDto>> UpdateProgress([FromBody] UpdateProgressDto dto)
    {
        var userId = GetUserId();
        await EnsureUserStatsAsync(userId);
        var progress = await _progressService.UpdateProgressAsync(userId, dto);
        return Ok(progress);
    }

    [HttpGet("leaderboard/{mode}")]
    public async Task<ActionResult<List<LeaderboardEntryDto>>> GetLeaderboard(
        string mode,
        [FromQuery] int limit = 10
    )
    {
        var leaderboard = await _progressService.GetLeaderboardAsync(mode, limit);
        return Ok(leaderboard);
    }
}
