using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartPath.Api.Services;

namespace SmartPath.Api.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
public class ProgressController : ControllerBase
{
    private readonly IProgressService _progressService;

    public ProgressController(IProgressService progressService)
    {
        _progressService = progressService;
    }

    [HttpPost("enrollments")]
    public async Task<IActionResult> EnrollInCourse([FromBody] EnrollRequest request)
    {
        var enrollment = await _progressService.EnrollInCourseAsync(
            request.ChildUserId,
            request.CourseId
        );
        return Ok(enrollment);
    }

    [HttpGet("children/{childId}/enrollments")]
    public async Task<IActionResult> GetEnrollments(int childId)
    {
        var userId = (int)HttpContext.Items["UserId"]!;

        var enrollments = await _progressService.GetEnrollmentsAsync(childId);
        return Ok(enrollments);
    }

    [HttpPost("lessons/{lessonId}/start")]
    public async Task<IActionResult> StartLesson(
        int lessonId,
        [FromBody] StartLessonRequest request
    )
    {
        var progress = await _progressService.StartLessonAsync(request.ChildUserId, lessonId);
        return Ok(progress);
    }

    [HttpPost("lessons/{lessonId}/complete")]
    public async Task<IActionResult> CompleteLesson(
        int lessonId,
        [FromBody] CompleteLessonRequest request
    )
    {
        var progress = await _progressService.CompleteLessonAsync(
            request.ChildUserId,
            lessonId,
            request.SelfAssessmentScore
        );

        return Ok(progress);
    }

    [HttpGet("children/{childId}/progress")]
    public async Task<IActionResult> GetProgress(int childId, [FromQuery] int? courseId)
    {
        var progress = await _progressService.GetChildProgressAsync(childId, courseId);
        return Ok(progress);
    }

    [HttpPost("practice-items/{itemId}/attempt")]
    public async Task<IActionResult> RecordAttempt(
        int itemId,
        [FromBody] RecordAttemptRequest request
    )
    {
        var attempt = await _progressService.RecordAttemptAsync(
            request.ChildUserId,
            itemId,
            request.Answer,
            request.IsCorrect,
            request.TimeSpentSeconds,
            request.HintsUsed
        );

        return Ok(attempt);
    }
}

public record EnrollRequest(int ChildUserId, int CourseId);

public record StartLessonRequest(int ChildUserId);

public record CompleteLessonRequest(int ChildUserId, int SelfAssessmentScore);

public record RecordAttemptRequest(
    int ChildUserId,
    string? Answer,
    bool IsCorrect,
    int TimeSpentSeconds,
    int HintsUsed
);
