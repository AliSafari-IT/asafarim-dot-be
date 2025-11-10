// apis/TestAutomation.Api/Controllers/DashboardController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestAutomation.Api.Data;
using TestAutomation.Api.Models;

namespace TestAutomation.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/dashboard")]
[Route("dashboard")] // Add this line to support both routes
public class DashboardController : ControllerBase
{
    private readonly TestAutomationDbContext _db;

    public DashboardController(TestAutomationDbContext db)
    {
        _db = db;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var now = DateTime.UtcNow;
        var thirtyDaysAgo = now.AddDays(-30);
        var sixtyDaysAgo = now.AddDays(-60);

        // Current period stats
        var currentRuns = await _db.TestRuns.Where(r => r.StartedAt >= thirtyDaysAgo).ToListAsync();

        // Previous period stats for trends
        var previousRuns = await _db
            .TestRuns.Where(r => r.StartedAt >= sixtyDaysAgo && r.StartedAt < thirtyDaysAgo)
            .ToListAsync();

        var currentStats = new
        {
            Total = currentRuns.Count,
            Passed = currentRuns.Count(r => r.Status == TestRunStatus.Completed),
            Failed = currentRuns.Count(r => r.Status == TestRunStatus.Failed),
            InProgress = currentRuns.Count(r => r.Status == TestRunStatus.Running),
        };

        var previousStats = new
        {
            Total = previousRuns.Count,
            Passed = previousRuns.Count(r => r.Status == TestRunStatus.Completed),
            Failed = previousRuns.Count(r => r.Status == TestRunStatus.Failed),
            InProgress = previousRuns.Count(r => r.Status == TestRunStatus.Running),
        };

        // Calculate trends
        var totalTrend =
            previousStats.Total == 0
                ? "+0%"
                : $"+{((currentStats.Total - previousStats.Total) * 100.0 / previousStats.Total):F0}%";

        var passedTrend =
            previousStats.Passed == 0
                ? "+0%"
                : $"+{((currentStats.Passed - previousStats.Passed) * 100.0 / previousStats.Passed):F0}%";

        var failedTrend =
            previousStats.Failed == 0
                ? "+0%"
                : $"+{((currentStats.Failed - previousStats.Failed) * 100.0 / previousStats.Failed):F0}%";

        var inProgressTrend =
            previousStats.InProgress == 0
                ? "+0%"
                : $"+{((currentStats.InProgress - previousStats.InProgress) * 100.0 / previousStats.InProgress):F0}%";

        // Calculate pass and fail rates
        var passRate =
            currentStats.Total == 0 ? 0 : (currentStats.Passed * 100.0 / currentStats.Total);
        var failRate =
            currentStats.Total == 0 ? 0 : (currentStats.Failed * 100.0 / currentStats.Total);

        return Ok(
            new
            {
                totalRuns = currentStats.Total,
                passedCount = currentStats.Passed,
                failedCount = currentStats.Failed,
                inProgressCount = currentStats.InProgress,
                passRate = Math.Round(passRate, 1),
                failRate = Math.Round(failRate, 1),
            }
        );
    }

    [HttpGet("recent-runs")]
    public async Task<IActionResult> GetRecentRuns()
    {
        var recentRuns = await _db
            .TestRuns.Include(r => r.TestResults)
            .Include(r => r.FunctionalRequirement)
            .OrderByDescending(r => r.StartedAt)
            .Take(10)
            .Select(r => new
            {
                id = r.Id,
                name = r.RunName
                    ?? (
                        r.FunctionalRequirement != null
                            ? r.FunctionalRequirement.Name
                            : "Manual Run"
                    ),
                status = r.Status == TestRunStatus.Completed ? "passed"
                : r.Status == TestRunStatus.Failed ? "failed"
                : r.Status == TestRunStatus.Running ? "in_progress"
                : "pending",
                passed = r.TestResults.Count(tr => tr.Status == TestStatus.Passed),
                failed = r.TestResults.Count(tr => tr.Status == TestStatus.Failed),
                date = r.StartedAt.HasValue
                    ? r.StartedAt.Value.ToString("yyyy-MM-dd HH:mm")
                    : "N/A",
            })
            .ToListAsync();

        return Ok(recentRuns);
    }
}
