using Microsoft.EntityFrameworkCore;
using SmartPath.Api.Data;
using SmartPath.Api.Entities;
using System.Threading.Tasks;

namespace SmartPath.Api.Services;

public interface IRewardsService
{
    System.Threading.Tasks.Task SeedAchievementsAsync();
}

public class RewardsService : IRewardsService
{
    private readonly SmartPathDbContext _context;
    private readonly ILogger<RewardsService> _logger;

    public RewardsService(SmartPathDbContext context, ILogger<RewardsService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async System.Threading.Tasks.Task SeedAchievementsAsync()
    {
        var existingCount = await _context.Achievements.CountAsync();
        if (existingCount > 0)
            return;

        var achievements = new List<Achievement>
        {
            new Achievement
            {
                Name = "First Attempt",
                Description = "Submit your first practice attempt",
                IconUrl = "🎯",
                Category = "Practice",
                Requirement = "first_attempt",
                CreatedAt = DateTime.UtcNow
            },
            new Achievement
            {
                Name = "Session Master",
                Description = "Complete your first practice session",
                IconUrl = "✅",
                Category = "Practice",
                Requirement = "first_session_complete",
                CreatedAt = DateTime.UtcNow
            },
            new Achievement
            {
                Name = "On Fire",
                Description = "Achieve a 3-day practice streak",
                IconUrl = "🔥",
                Category = "Streak",
                Requirement = "streak_3",
                CreatedAt = DateTime.UtcNow
            },
            new Achievement
            {
                Name = "Week Warrior",
                Description = "Achieve a 7-day practice streak",
                IconUrl = "⚡",
                Category = "Streak",
                Requirement = "streak_7",
                CreatedAt = DateTime.UtcNow
            },
            new Achievement
            {
                Name = "Accuracy Expert",
                Description = "Achieve 80% accuracy in last 20 attempts",
                IconUrl = "🎓",
                Category = "Accuracy",
                Requirement = "accuracy_80",
                CreatedAt = DateTime.UtcNow
            },
            new Achievement
            {
                Name = "Point Collector",
                Description = "Earn 100 total points",
                IconUrl = "💎",
                Category = "Points",
                Requirement = "points_100",
                CreatedAt = DateTime.UtcNow
            }
        };

        _context.Achievements.AddRange(achievements);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} achievements", achievements.Count);
    }
}
