using Microsoft.EntityFrameworkCore;
using SmartPath.Api.Data;
using SmartPath.Api.DTOs;
using SmartPath.Api.Entities;

namespace SmartPath.Api.Services;

public class ProgressService : IProgressService
{
    private readonly SmartPathDbContext _context;

    public ProgressService(SmartPathDbContext context)
    {
        _context = context;
    }

    public async Task<ChildCourseEnrollment> EnrollInCourseAsync(int childUserId, int courseId)
    {
        var existing = await _context.ChildCourseEnrollments.FirstOrDefaultAsync(e =>
            e.ChildUserId == childUserId && e.CourseId == courseId
        );

        if (existing != null)
        {
            return existing;
        }

        var enrollment = new ChildCourseEnrollment
        {
            ChildUserId = childUserId,
            CourseId = courseId,
            OverallProgress = 0,
            AverageMastery = 0,
            TotalLessonsCompleted = 0,
            TotalTimeSpentMinutes = 0,
            EnrolledAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _context.ChildCourseEnrollments.Add(enrollment);
        await _context.SaveChangesAsync();

        return enrollment;
    }

    public async Task<List<ChildCourseEnrollment>> GetEnrollmentsAsync(int childUserId)
    {
        return await _context
            .ChildCourseEnrollments.Include(e => e.Course)
            .Where(e => e.ChildUserId == childUserId)
            .ToListAsync();
    }

    public async Task<LessonProgress> StartLessonAsync(int childUserId, int lessonId)
    {
        var existing = await _context.LessonProgress.FirstOrDefaultAsync(lp =>
            lp.ChildUserId == childUserId && lp.LessonId == lessonId
        );

        if (existing != null)
        {
            return existing;
        }

        var progress = new LessonProgress
        {
            ChildUserId = childUserId,
            LessonId = lessonId,
            Status = "InProgress",
            MasteryLevel = 0,
            SelfAssessmentScore = 0,
            FirstAttemptedAt = DateTime.UtcNow,
            ReviewCount = 0,
            TotalTimeSpentMinutes = 0,
            TotalPracticeAttempts = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _context.LessonProgress.Add(progress);
        await _context.SaveChangesAsync();

        return progress;
    }

    public async Task<LessonProgress> CompleteLessonAsync(
        int childUserId,
        int lessonId,
        int selfAssessmentScore
    )
    {
        var progress = await _context.LessonProgress.FirstOrDefaultAsync(lp =>
            lp.ChildUserId == childUserId && lp.LessonId == lessonId
        );

        if (progress == null)
        {
            progress = await StartLessonAsync(childUserId, lessonId);
        }

        progress.Status = "Completed";
        progress.SelfAssessmentScore = selfAssessmentScore;
        progress.CompletedAt = DateTime.UtcNow;
        progress.MasteryLevel = CalculateMasteryLevel(selfAssessmentScore, 0);
        progress.NextReviewDate = CalculateNextReviewDate(selfAssessmentScore);
        progress.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return progress;
    }

    public async Task<List<LessonProgress>> GetChildProgressAsync(
        int childUserId,
        int? courseId = null
    )
    {
        var query = _context
            .LessonProgress.Include(lp => lp.Lesson)
            .ThenInclude(l => l.Chapter)
            .ThenInclude(c => c.Course)
            .Where(lp => lp.ChildUserId == childUserId);

        if (courseId.HasValue)
        {
            query = query.Where(lp => lp.Lesson!.Chapter!.CourseId == courseId.Value);
        }

        return await query.ToListAsync();
    }

    public async Task<PracticeAttempt> RecordAttemptAsync(
        int childUserId,
        int practiceItemId,
        string? answer,
        bool isCorrect,
        int timeSpentSeconds,
        int hintsUsed
    )
    {
        var practiceItem = await _context.PracticeItems.FindAsync(practiceItemId);
        if (practiceItem == null)
        {
            throw new KeyNotFoundException($"Practice item {practiceItemId} not found");
        }

        var attempt = new PracticeAttempt
        {
            ChildUserId = childUserId,
            PracticeItemId = practiceItemId,
            LessonId = practiceItem.LessonId,
            Answer = answer,
            IsCorrect = isCorrect,
            TimeSpentSeconds = timeSpentSeconds,
            HintsUsed = hintsUsed,
            AttemptedAt = DateTime.UtcNow,
        };

        _context.PracticeAttempts.Add(attempt);
        await _context.SaveChangesAsync();

        return attempt;
    }

    private decimal CalculateMasteryLevel(int selfAssessment, decimal practiceAccuracy)
    {
        var selfAssessmentPoints = selfAssessment * 15m;
        var practicePoints = practiceAccuracy * 20m;
        return Math.Min(100, selfAssessmentPoints + practicePoints);
    }

    private DateTime CalculateNextReviewDate(int selfAssessmentScore)
    {
        return selfAssessmentScore switch
        {
            1 => DateTime.UtcNow.AddDays(1),
            2 => DateTime.UtcNow.AddDays(3),
            3 => DateTime.UtcNow.AddDays(7),
            4 => DateTime.UtcNow.AddDays(14),
            5 => DateTime.UtcNow.AddDays(21),
            _ => DateTime.UtcNow.AddDays(7),
        };
    }

    public async Task<ProgressSummaryDto> GetProgressSummaryAsync(
        int familyId,
        int? memberId,
        DateTime? from,
        DateTime? to
    )
    {
        var query = _context
            .PracticeSessions.Include(s => s.Attempts)
            .Where(s => s.FamilyId == familyId);

        if (memberId.HasValue)
            query = query.Where(s => s.ChildUserId == memberId.Value);
        if (from.HasValue)
            query = query.Where(s => s.StartedAt >= from.Value);
        if (to.HasValue)
            query = query.Where(s => s.StartedAt <= to.Value);

        var sessions = await query.ToListAsync();
        var allAttempts = sessions.SelectMany(s => s.Attempts).ToList();

        var totalAttempts = allAttempts.Count;
        var correctAttempts = allAttempts.Count(a => a.IsCorrect);
        var accuracy = totalAttempts > 0 ? (decimal)correctAttempts / totalAttempts : 0;

        return new ProgressSummaryDto
        {
            TotalSessions = sessions.Count,
            TotalAttempts = totalAttempts,
            AccuracyPercentage = Math.Round(accuracy * 100, 2),
            CurrentStreak = 0,
            BestStreak = 0,
            TotalPoints = sessions.Sum(s => s.TotalPoints),
        };
    }

    public async Task<List<LessonProgressDto>> GetLessonProgressListAsync(
        int familyId,
        int? memberId,
        DateTime? from,
        DateTime? to,
        int page,
        int pageSize,
        string? sort
    )
    {
        var query = _context
            .PracticeAttempts.Include(a => a.PracticeItem)
            .ThenInclude(pi => pi.Lesson)
            .Where(a =>
                a.PracticeItem != null
                && a.PracticeItem.Lesson != null
                && a.PracticeItem.Lesson.FamilyId == familyId
            );

        if (memberId.HasValue)
            query = query.Where(a => a.ChildUserId == memberId.Value);
        if (from.HasValue)
            query = query.Where(a => a.AttemptedAt >= from.Value);
        if (to.HasValue)
            query = query.Where(a => a.AttemptedAt <= to.Value);

        var attempts = await query.ToListAsync();

        var lessonGroups = attempts
            .Where(a => a.PracticeItem?.Lesson != null)
            .GroupBy(a => new { a.LessonId, Title = a.PracticeItem!.Lesson!.Title })
            .Select(g => new LessonProgressDto
            {
                LessonId = g.Key.LessonId,
                LessonTitle = g.Key.Title ?? "Unknown",
                AttemptCount = g.Count(),
                Accuracy = g.Count() > 0 ? (decimal)g.Count(a => a.IsCorrect) / g.Count() : 0,
                LastPracticed = g.Max(a => (DateTime?)a.AttemptedAt),
                PointsEarned = g.Count(a => a.IsCorrect) * 10,
            })
            .ToList();

        lessonGroups = sort?.ToLower() switch
        {
            "accuracy" => lessonGroups.OrderBy(l => l.Accuracy).ToList(),
            "attempts" => lessonGroups.OrderByDescending(l => l.AttemptCount).ToList(),
            "lastpracticed" => lessonGroups.OrderByDescending(l => l.LastPracticed).ToList(),
            _ => lessonGroups.OrderBy(l => l.LessonTitle).ToList(),
        };

        return lessonGroups.Skip((page - 1) * pageSize).Take(pageSize).ToList();
    }

    public async Task<List<TimeSeriesDataDto>> GetTimeSeriesDataAsync(
        int familyId,
        int? memberId,
        DateTime? from,
        DateTime? to
    )
    {
        var query = _context
            .PracticeAttempts.Include(a => a.PracticeItem)
            .ThenInclude(pi => pi.Lesson)
            .Where(a =>
                a.PracticeItem != null
                && a.PracticeItem.Lesson != null
                && a.PracticeItem.Lesson.FamilyId == familyId
            );

        if (memberId.HasValue)
            query = query.Where(a => a.ChildUserId == memberId.Value);
        if (from.HasValue)
            query = query.Where(a => a.AttemptedAt >= from.Value);
        if (to.HasValue)
            query = query.Where(a => a.AttemptedAt <= to.Value);

        var attempts = await query.ToListAsync();

        return attempts
            .GroupBy(a => a.AttemptedAt.Date)
            .Select(g => new TimeSeriesDataDto
            {
                Date = g.Key,
                AttemptCount = g.Count(),
                Accuracy = g.Count() > 0 ? (decimal)g.Count(a => a.IsCorrect) / g.Count() : 0,
            })
            .OrderBy(d => d.Date)
            .ToList();
    }
}
