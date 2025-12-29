using SmartPath.Api.Entities;

namespace SmartPath.Api.Services;

public interface IProgressService
{
    Task<ChildCourseEnrollment> EnrollInCourseAsync(int childUserId, int courseId);
    Task<List<ChildCourseEnrollment>> GetEnrollmentsAsync(int childUserId);
    Task<LessonProgress> StartLessonAsync(int childUserId, int lessonId);
    Task<LessonProgress> CompleteLessonAsync(
        int childUserId,
        int lessonId,
        int selfAssessmentScore
    );
    Task<List<LessonProgress>> GetChildProgressAsync(int childUserId, int? courseId = null);
    Task<PracticeAttempt> RecordAttemptAsync(
        int childUserId,
        int practiceItemId,
        string? answer,
        bool isCorrect,
        int timeSpentSeconds,
        int hintsUsed
    );
}
