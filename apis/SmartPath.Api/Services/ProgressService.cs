using Microsoft.EntityFrameworkCore;
using SmartPath.Api.Data;
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
}
