using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartPath.Api.Data;
using SmartPath.Api.Entities;

namespace SmartPath.Api.Services;

public class PracticeItemService : IPracticeItemService
{
    private readonly SmartPathDbContext _context;
    private readonly ILogger<PracticeItemService> _logger;

    public PracticeItemService(SmartPathDbContext context, ILogger<PracticeItemService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async System.Threading.Tasks.Task<List<PracticeItemDto>> GetItemsByLessonAsync(
        int lessonId
    )
    {
        var items = await _context
            .PracticeItems.Where(p => p.LessonId == lessonId && p.IsActive)
            .OrderBy(p => p.PracticeItemId)
            .ToListAsync();

        return items.Select(MapToDto).ToList();
    }

    public async System.Threading.Tasks.Task<PracticeItemDto> CreateItemAsync(
        CreatePracticeItemDto dto,
        int userId
    )
    {
        var lesson = await _context.Lessons.FirstOrDefaultAsync(l => l.LessonId == dto.LessonId);
        if (lesson == null)
            throw new InvalidOperationException("Lesson not found");

        var item = new PracticeItem
        {
            LessonId = dto.LessonId,
            CreatedByUserId = userId,
            QuestionText = dto.QuestionText,
            ExpectedAnswer = dto.ExpectedAnswer,
            Points = dto.Points,
            Difficulty = dto.Difficulty,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _context.PracticeItems.Add(item);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Practice item created: itemId={ItemId}, lessonId={LessonId}",
            item.PracticeItemId,
            dto.LessonId
        );

        return MapToDto(item);
    }

    public async System.Threading.Tasks.Task<PracticeItemDto> UpdateItemAsync(
        int itemId,
        UpdatePracticeItemDto dto,
        int userId
    )
    {
        var item = await _context.PracticeItems.FirstOrDefaultAsync(p =>
            p.PracticeItemId == itemId
        );
        if (item == null)
            throw new InvalidOperationException("Practice item not found");

        item.QuestionText = dto.QuestionText;
        item.ExpectedAnswer = dto.ExpectedAnswer;
        item.Points = dto.Points;
        item.Difficulty = dto.Difficulty;
        item.IsActive = dto.IsActive;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Practice item updated: itemId={ItemId}", itemId);

        return MapToDto(item);
    }

    public async System.Threading.Tasks.Task DeleteItemAsync(int itemId, int userId)
    {
        var item = await _context.PracticeItems.FirstOrDefaultAsync(p =>
            p.PracticeItemId == itemId
        );
        if (item == null)
            throw new InvalidOperationException("Practice item not found");

        item.IsActive = false;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Practice item deleted (soft): itemId={ItemId}", itemId);
    }

    public async System.Threading.Tasks.Task<PracticeItemDto> GetNextItemAsync(
        int sessionId,
        int userId
    )
    {
        var session = await _context.PracticeSessions.FirstOrDefaultAsync(s => s.Id == sessionId);
        if (session == null)
            throw new InvalidOperationException("Session not found");

        var attemptedItemIds = await _context
            .PracticeAttempts.Where(a =>
                a.PracticeSessionId == session.Id
            )
            .Select(a => a.PracticeItemId)
            .Distinct()
            .ToListAsync();

        var nextItem = await _context
            .PracticeItems.Where(p =>
                p.LessonId == session.LessonId
                && p.IsActive
                && !attemptedItemIds.Contains(p.PracticeItemId)
            )
            .OrderBy(p => p.PracticeItemId)
            .FirstOrDefaultAsync();

        if (nextItem == null)
            throw new InvalidOperationException(
                "No more practice items available for this session"
            );

        return MapToDto(nextItem);
    }

    public async System.Threading.Tasks.Task<PracticeDashboardDto> GetFamilyDashboardAsync(
        int familyId,
        int userId
    )
    {
        var familyMembers = await _context
            .FamilyMembers.Where(fm => fm.FamilyId == familyId)
            .Select(fm => fm.UserId)
            .ToListAsync();

        var dashboard = new PracticeDashboardDto();

        foreach (var childId in familyMembers)
        {
            var child = await _context.Users.FirstOrDefaultAsync(u => u.UserId == childId);
            if (child == null)
                continue;

            var sessions = await _context
                .PracticeSessions.Where(s => s.ChildUserId == childId && s.Status == "Completed")
                .ToListAsync();

            var attempts = await _context
                .PracticeAttempts.Include(a => a.PracticeItem)
                .ThenInclude(pi => pi.Lesson)
                .Where(a => a.ChildUserId == childId)
                .OrderByDescending(a => a.AttemptedAt)
                .ToListAsync();

            var streak = await _context.Streaks.FirstOrDefaultAsync(s => s.UserId == childId);

            var totalPoints = sessions.Sum(s => s.TotalPoints);
            var correctAttempts = attempts.Count(a => a.IsCorrect);
            var accuracy = attempts.Count > 0 ? (double)correctAttempts / attempts.Count : 0;

            var recentAttempts = attempts
                .Take(20)
                .Select(a => new AttemptSummaryDto
                {
                    AttemptId = a.AttemptId,
                    QuestionPreview =
                        a.PracticeItem?.QuestionText?.Substring(
                            0,
                            Math.Min(50, a.PracticeItem?.QuestionText?.Length ?? 0)
                        ) ?? "",
                    IsCorrect = a.IsCorrect,
                    PointsAwarded = a.PointsAwarded,
                    LessonId = a.LessonId,
                    LessonTitle = a.PracticeItem?.Lesson?.Title ?? "",
                    AttemptedAt = a.AttemptedAt,
                })
                .ToList();

            var lessonAccuracy = attempts
                .GroupBy(a => a.LessonId)
                .Select(g => new WeakLessonDto
                {
                    LessonId = g.Key,
                    LessonTitle = g.First().PracticeItem?.Lesson?.Title ?? "",
                    Accuracy = (double)g.Count(a => a.IsCorrect) / g.Count(),
                    AttemptCount = g.Count(),
                })
                .OrderBy(l => l.Accuracy)
                .Take(5)
                .ToList();

            dashboard.Children.Add(
                new ChildDashboardDto
                {
                    ChildUserId = childId,
                    ChildName = child.Email,
                    TotalPoints = totalPoints,
                    CurrentStreak = streak?.CurrentStreak ?? 0,
                    Accuracy = accuracy,
                    RecentAttempts = recentAttempts,
                    WeakLessons = lessonAccuracy,
                }
            );
        }

        return dashboard;
    }

    private PracticeItemDto MapToDto(PracticeItem item)
    {
        return new PracticeItemDto
        {
            Id = item.PracticeItemId,
            LessonId = item.LessonId,
            QuestionText = item.QuestionText,
            Points = item.Points,
            Difficulty = item.Difficulty,
            IsActive = item.IsActive,
            CreatedAt = item.CreatedAt,
        };
    }
}
