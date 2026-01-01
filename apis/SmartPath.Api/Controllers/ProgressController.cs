using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartPath.Api.Services;
using SmartPath.Api.DTOs;

namespace SmartPath.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProgressController : ControllerBase
{
    private readonly IProgressService _progressService;
    private readonly IFamilyService _familyService;

    public ProgressController(IProgressService progressService, IFamilyService familyService)
    {
        _progressService = progressService;
        _familyService = familyService;
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

    [HttpGet("families")]
    public async Task<IActionResult> GetFamilies()
    {
        var userId = (int)HttpContext.Items["UserId"]!;
        var families = await _familyService.GetUserFamiliesAsync(userId);
        return Ok(families);
    }

    [HttpGet("families/{familyId}/summary")]
    public async Task<IActionResult> GetFamilySummary(
        int familyId,
        [FromQuery] int? memberId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var userId = (int)HttpContext.Items["UserId"]!;
        var isMember = await _familyService.IsMemberAsync(familyId, userId);
        if (!isMember)
            return Forbid();

        var summary = await _progressService.GetProgressSummaryAsync(familyId, memberId, from, to);
        return Ok(summary);
    }

    [HttpGet("families/{familyId}/lessons")]
    public async Task<IActionResult> GetFamilyLessons(
        int familyId,
        [FromQuery] int? memberId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? sort = null)
    {
        var userId = (int)HttpContext.Items["UserId"]!;
        var isMember = await _familyService.IsMemberAsync(familyId, userId);
        if (!isMember)
            return Forbid();

        var lessons = await _progressService.GetLessonProgressListAsync(familyId, memberId, from, to, page, pageSize, sort);
        return Ok(lessons);
    }

    [HttpGet("families/{familyId}/timeseries")]
    public async Task<IActionResult> GetFamilyTimeSeries(
        int familyId,
        [FromQuery] int? memberId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var userId = (int)HttpContext.Items["UserId"]!;
        var isMember = await _familyService.IsMemberAsync(familyId, userId);
        if (!isMember)
            return Forbid();

        var timeSeries = await _progressService.GetTimeSeriesDataAsync(familyId, memberId, from, to);
        return Ok(timeSeries);
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
