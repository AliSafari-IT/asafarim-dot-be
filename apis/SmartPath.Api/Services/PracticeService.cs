using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartPath.Api.Data;
using SmartPath.Api.Entities;

namespace SmartPath.Api.Services;

public class PracticeService : IPracticeService
{
    private readonly SmartPathDbContext _context;
    private readonly ILogger<PracticeService> _logger;

    public PracticeService(SmartPathDbContext context, ILogger<PracticeService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async System.Threading.Tasks.Task<PracticeSessionResponseDto> CreateSessionAsync(
        CreatePracticeSessionRequestDto dto,
        int userId
    )
    {
        var child = await _context.Users.FirstOrDefaultAsync(u => u.UserId == dto.ChildUserId);
        if (child == null)
            throw new InvalidOperationException("Child user not found");

        var lesson = await _context.Lessons.FirstOrDefaultAsync(l => l.LessonId == dto.LessonId);
        if (lesson == null)
            throw new InvalidOperationException("Lesson not found");

        var session = new PracticeSession
        {
            FamilyId = dto.FamilyId,
            ChildUserId = dto.ChildUserId,
            LessonId = dto.LessonId,
            StartedAt = DateTime.UtcNow,
            Status = "InProgress",
            TotalPoints = 0,
        };

        _context.PracticeSessions.Add(session);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Practice session created: sessionId={SessionId}, childId={ChildId}, lessonId={LessonId}",
            session.Id,
            dto.ChildUserId,
            dto.LessonId
        );

        return MapSessionToDto(session);
    }

    public async System.Threading.Tasks.Task<PracticeSessionResponseDto> CompleteSessionAsync(
        int sessionId,
        int userId
    )
    {
        var session = await _context
            .PracticeSessions.Include(s => s.Attempts)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        if (session == null)
            throw new InvalidOperationException("Session not found");

        session.EndedAt = DateTime.UtcNow;
        session.Status = "Completed";
        session.TotalPoints = 0;

        await UpdateStreakAsync(session.ChildUserId);
        await AwardAchievementsAsync(session.ChildUserId);

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Practice session completed: sessionId={SessionId}, childId={ChildId}, points={Points}",
            sessionId,
            session.ChildUserId,
            session.TotalPoints
        );

        return MapSessionToDto(session);
    }

    public async System.Threading.Tasks.Task<PracticeAttemptResponseDto> SubmitAttemptAsync(
        CreatePracticeAttemptRequestDto dto,
        int userId
    )
    {
        var session = await _context.PracticeSessions.FirstOrDefaultAsync(s =>
            s.Id == dto.SessionId
        );
        if (session == null)
            throw new InvalidOperationException("Session not found");

        var practiceItem = await _context.PracticeItems.FirstOrDefaultAsync(p =>
            p.PracticeItemId == dto.PracticeItemId
        );
        if (practiceItem == null)
            throw new InvalidOperationException("Practice item not found");

        var normalizedAnswer = NormalizeAnswer(dto.Answer);
        var expectedAnswer = NormalizeAnswer(practiceItem.ExpectedAnswer);
        var isCorrect = normalizedAnswer == expectedAnswer;
        var pointsAwarded = isCorrect ? practiceItem.Points : 0;

        var attempt = new PracticeAttempt
        {
            PracticeSessionId = dto.SessionId,
            ChildUserId = session.ChildUserId,
            LessonId = session.LessonId,
            PracticeItemId = dto.PracticeItemId,
            Answer = dto.Answer,
            IsCorrect = isCorrect,
            TimeSpentSeconds = 0,
            HintsUsed = 0,
            AttemptedAt = DateTime.UtcNow,
        };

        _context.PracticeAttempts.Add(attempt);
        session.TotalPoints += pointsAwarded;

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Practice attempt submitted: sessionId={SessionId}, childId={ChildId}, correct={IsCorrect}, points={Points}",
            dto.SessionId,
            session.ChildUserId,
            isCorrect,
            pointsAwarded
        );

        return MapAttemptToDto(attempt, pointsAwarded);
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
                a.ChildUserId == session.ChildUserId && a.LessonId == session.LessonId
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
            throw new InvalidOperationException("No more practice items available for this session");

        return new PracticeItemDto
        {
            Id = nextItem.PracticeItemId,
            LessonId = nextItem.LessonId,
            QuestionText = nextItem.QuestionText,
            Points = nextItem.Points,
            Difficulty = nextItem.Difficulty,
            IsActive = nextItem.IsActive,
            CreatedAt = nextItem.CreatedAt,
        };
    }

    private string NormalizeAnswer(string answer)
    {
        return answer?.Trim().ToLowerInvariant() ?? "";
    }

    public async System.Threading.Tasks.Task<ChildPracticeSummaryDto> GetChildSummaryAsync(
        int childId,
        int userId
    )
    {
        var child = await _context.Users.FirstOrDefaultAsync(u => u.UserId == childId);
        if (child == null)
            throw new InvalidOperationException("Child not found");

        var sessions = await _context
            .PracticeSessions.Where(s => s.ChildUserId == childId)
            .ToListAsync();

        var attempts = await _context
            .PracticeAttempts.Where(a => a.ChildUserId == childId)
            .ToListAsync();

        var streak = await _context.Streaks.FirstOrDefaultAsync(s => s.UserId == childId);

        var achievements = await _context
            .UserAchievements.Include(ua => ua.Achievement)
            .Where(ua => ua.UserId == childId)
            .OrderByDescending(ua => ua.EarnedAt)
            .Take(5)
            .ToListAsync();

        var totalPoints = sessions.Sum(s => s.TotalPoints);
        var correctAttempts = attempts.Count(a => a.IsCorrect);
        var correctRate = attempts.Count > 0 ? (double)correctAttempts / attempts.Count : 0;

        return new ChildPracticeSummaryDto
        {
            ChildUserId = childId,
            ChildName = child.Email,
            TotalPoints = totalPoints,
            SessionsCount = sessions.Count(s => s.Status == "Completed"),
            AttemptsCount = attempts.Count,
            CorrectRate = correctRate,
            CurrentStreak = streak?.CurrentStreak ?? 0,
            BestStreak = streak?.LongestStreak ?? 0,
            RecentAchievements = achievements
                .Select(ua => new UserAchievementDto
                {
                    Id = ua.UserAchievementId,
                    ChildUserId = ua.UserId,
                    Achievement = new AchievementDto
                    {
                        Id = ua.Achievement.AchievementId,
                        Key = ua.Achievement.Requirement ?? "",
                        Title = ua.Achievement.Name,
                        Description = ua.Achievement.Description ?? "",
                        Icon = ua.Achievement.IconUrl ?? "",
                        Points = 0,
                        IsActive = true,
                    },
                    AwardedAt = ua.EarnedAt,
                })
                .ToList(),
        };
    }

    public async System.Threading.Tasks.Task<FamilyChildrenSummaryDto> GetFamilyChildrenSummaryAsync(
        int familyId,
        int userId
    )
    {
        var familyMembers = await _context
            .FamilyMembers.Where(fm => fm.FamilyId == familyId)
            .Select(fm => fm.UserId)
            .ToListAsync();

        var childrenSummaries = new List<ChildPracticeSummaryDto>();

        foreach (var childId in familyMembers)
        {
            try
            {
                var summary = await GetChildSummaryAsync(childId, userId);
                childrenSummaries.Add(summary);
            }
            catch
            {
                // Skip children with errors
            }
        }

        return new FamilyChildrenSummaryDto { FamilyId = familyId, Children = childrenSummaries };
    }

    public async System.Threading.Tasks.Task<List<UserAchievementDto>> GetChildAchievementsAsync(
        int childId,
        int userId
    )
    {
        var achievements = await _context
            .UserAchievements.Include(ua => ua.Achievement)
            .Where(ua => ua.UserId == childId)
            .OrderByDescending(ua => ua.EarnedAt)
            .ToListAsync();

        return achievements
            .Select(ua => new UserAchievementDto
            {
                Id = ua.UserAchievementId,
                ChildUserId = ua.UserId,
                Achievement = new AchievementDto
                {
                    Id = ua.Achievement.AchievementId,
                    Key = ua.Achievement.Requirement ?? "",
                    Title = ua.Achievement.Name,
                    Description = ua.Achievement.Description ?? "",
                    Icon = ua.Achievement.IconUrl ?? "",
                    Points = 0,
                    IsActive = true,
                },
                AwardedAt = ua.EarnedAt,
            })
            .ToList();
    }

    public async System.Threading.Tasks.Task<List<AchievementDto>> GetAvailableAchievementsAsync()
    {
        var achievements = await _context.Achievements.ToListAsync();

        return achievements
            .Select(a => new AchievementDto
            {
                Id = a.AchievementId,
                Key = a.Requirement ?? "",
                Title = a.Name,
                Description = a.Description ?? "",
                Icon = a.IconUrl ?? "",
                Points = 0,
                IsActive = true,
            })
            .ToList();
    }

    private async System.Threading.Tasks.Task UpdateStreakAsync(int childId)
    {
        var streak = await _context.Streaks.FirstOrDefaultAsync(s => s.UserId == childId);
        var today = DateTime.UtcNow.Date;

        if (streak == null)
        {
            streak = new Streak
            {
                UserId = childId,
                CurrentStreak = 1,
                LongestStreak = 1,
                LastActivityDate = today,
                UpdatedAt = DateTime.UtcNow,
            };
            _context.Streaks.Add(streak);
        }
        else
        {
            var lastActivity = streak.LastActivityDate.Date;
            var daysSinceLastActivity = (today - lastActivity).Days;

            if (daysSinceLastActivity == 0)
            {
                // Same day, no change
            }
            else if (daysSinceLastActivity == 1)
            {
                // Consecutive day, increment streak
                streak.CurrentStreak++;
                if (streak.CurrentStreak > streak.LongestStreak)
                    streak.LongestStreak = streak.CurrentStreak;
            }
            else
            {
                // Gap > 1 day, reset streak
                streak.CurrentStreak = 1;
            }

            streak.LastActivityDate = today;
            streak.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    private async System.Threading.Tasks.Task AwardAchievementsAsync(int childId)
    {
        var existingAchievements = await _context
            .UserAchievements.Where(ua => ua.UserId == childId)
            .Select(ua => ua.AchievementId)
            .ToListAsync();

        var allAchievements = await _context.Achievements.ToListAsync();

        // first_attempt
        var firstAttempt = allAchievements.FirstOrDefault(a => a.Requirement == "first_attempt");
        if (firstAttempt != null && !existingAchievements.Contains(firstAttempt.AchievementId))
        {
            var attempts = await _context
                .PracticeAttempts.Where(a => a.ChildUserId == childId)
                .CountAsync();

            if (attempts == 1)
            {
                await AwardAchievementAsync(childId, firstAttempt.AchievementId);
            }
        }

        // first_session_complete
        var firstSessionComplete = allAchievements.FirstOrDefault(a =>
            a.Requirement == "first_session_complete"
        );
        if (
            firstSessionComplete != null
            && !existingAchievements.Contains(firstSessionComplete.AchievementId)
        )
        {
            var completedSessions = await _context
                .PracticeSessions.Where(s => s.ChildUserId == childId && s.Status == "Completed")
                .CountAsync();

            if (completedSessions == 1)
            {
                await AwardAchievementAsync(childId, firstSessionComplete.AchievementId);
            }
        }

        // streak_3
        var streak3 = allAchievements.FirstOrDefault(a => a.Requirement == "streak_3");
        if (streak3 != null && !existingAchievements.Contains(streak3.AchievementId))
        {
            var streak = await _context.Streaks.FirstOrDefaultAsync(s => s.UserId == childId);
            if (streak?.CurrentStreak >= 3)
            {
                await AwardAchievementAsync(childId, streak3.AchievementId);
            }
        }

        // streak_7
        var streak7 = allAchievements.FirstOrDefault(a => a.Requirement == "streak_7");
        if (streak7 != null && !existingAchievements.Contains(streak7.AchievementId))
        {
            var streak = await _context.Streaks.FirstOrDefaultAsync(s => s.UserId == childId);
            if (streak?.CurrentStreak >= 7)
            {
                await AwardAchievementAsync(childId, streak7.AchievementId);
            }
        }

        // accuracy_80
        var accuracy80 = allAchievements.FirstOrDefault(a => a.Requirement == "accuracy_80");
        if (accuracy80 != null && !existingAchievements.Contains(accuracy80.AchievementId))
        {
            var lastAttempts = await _context
                .PracticeAttempts.Where(a => a.ChildUserId == childId)
                .OrderByDescending(a => a.AttemptedAt)
                .Take(20)
                .ToListAsync();

            if (lastAttempts.Count >= 20)
            {
                var correctCount = lastAttempts.Count(a => a.IsCorrect);
                if (correctCount >= 16)
                {
                    await AwardAchievementAsync(childId, accuracy80.AchievementId);
                }
            }
        }

        // points_100
        var points100 = allAchievements.FirstOrDefault(a => a.Requirement == "points_100");
        if (points100 != null && !existingAchievements.Contains(points100.AchievementId))
        {
            var totalPoints = await _context
                .PracticeSessions.Where(s => s.ChildUserId == childId)
                .SumAsync(s => s.TotalPoints);

            if (totalPoints >= 100)
            {
                await AwardAchievementAsync(childId, points100.AchievementId);
            }
        }
    }

    private async System.Threading.Tasks.Task AwardAchievementAsync(int childId, int achievementId)
    {
        var existing = await _context.UserAchievements.FirstOrDefaultAsync(ua =>
            ua.UserId == childId && ua.AchievementId == achievementId
        );

        if (existing == null)
        {
            var userAchievement = new UserAchievement
            {
                UserId = childId,
                AchievementId = achievementId,
                EarnedAt = DateTime.UtcNow,
            };

            _context.UserAchievements.Add(userAchievement);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Achievement awarded: childId={ChildId}, achievementId={AchievementId}",
                childId,
                achievementId
            );
        }
    }

    private PracticeSessionResponseDto MapSessionToDto(PracticeSession session)
    {
        return new PracticeSessionResponseDto
        {
            Id = session.Id,
            ChildUserId = session.ChildUserId,
            LessonId = session.LessonId,
            StartedAt = session.StartedAt,
            EndedAt = session.EndedAt,
            TotalPoints = session.TotalPoints,
            Status = session.Status,
            Attempts = session.Attempts?.Select(a => MapAttemptToDto(a)).ToList() ?? new(),
        };
    }

    private PracticeAttemptResponseDto MapAttemptToDto(
        PracticeAttempt attempt,
        int pointsAwarded = 0
    )
    {
        return new PracticeAttemptResponseDto
        {
            Id = attempt.AttemptId,
            SessionId = 0,
            Prompt = "",
            Answer = attempt.Answer ?? "",
            IsCorrect = attempt.IsCorrect,
            PointsAwarded = pointsAwarded,
            AttemptedAt = attempt.AttemptedAt,
        };
    }
}
