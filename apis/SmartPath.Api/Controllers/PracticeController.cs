using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartPath.Api.DTOs;
using SmartPath.Api.Services;

namespace SmartPath.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PracticeController : ControllerBase
{
    private readonly IPracticeService _practiceService;
    private readonly IPracticeItemService _itemService;
    private readonly ILogger<PracticeController> _logger;

    public PracticeController(
        IPracticeService practiceService,
        IPracticeItemService itemService,
        ILogger<PracticeController> logger
    )
    {
        _practiceService = practiceService;
        _itemService = itemService;
        _logger = logger;
    }

    [HttpPost("sessions")]
    public async System.Threading.Tasks.Task<
        ActionResult<PracticeSessionResponseDto>
    > CreateSession([FromBody] CreatePracticeSessionRequestDto dto)
    {
        try
        {
            var userId = GetUserId();
            var session = await _practiceService.CreateSessionAsync(dto, userId);
            return Ok(session);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating practice session");
            return StatusCode(500, new { error = "Failed to create session" });
        }
    }

    [HttpPost("sessions/{sessionId}/complete")]
    public async System.Threading.Tasks.Task<
        ActionResult<PracticeSessionResponseDto>
    > CompleteSession(int sessionId)
    {
        try
        {
            var userId = GetUserId();
            var session = await _practiceService.CompleteSessionAsync(sessionId, userId);
            return Ok(session);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing practice session {SessionId}", sessionId);
            return StatusCode(500, new { error = "Failed to complete session" });
        }
    }

    [HttpPost("sessions/{sessionId}/next-item")]
    public async System.Threading.Tasks.Task<ActionResult<PracticeItemDto>> GetNextItem(
        int sessionId
    )
    {
        try
        {
            var userId = GetUserId();
            var item = await _itemService.GetNextItemAsync(sessionId, userId);
            return Ok(item);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error getting next practice item for session {SessionId}",
                sessionId
            );
            return StatusCode(500, new { error = "Failed to get next item" });
        }
    }

    [HttpPost("attempts")]
    public async System.Threading.Tasks.Task<
        ActionResult<PracticeAttemptResponseDto>
    > SubmitAttempt([FromBody] CreatePracticeAttemptRequestDto dto)
    {
        try
        {
            var userId = GetUserId();
            var attempt = await _practiceService.SubmitAttemptAsync(dto, userId);
            return Ok(attempt); // Changed to Ok instead of CreatedAtAction
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting practice attempt");
            return StatusCode(500, new { error = "Failed to submit attempt" });
        }
    }

    [HttpGet("children/{childId}/summary")]
    public async System.Threading.Tasks.Task<ActionResult<ChildPracticeSummaryDto>> GetChildSummary(
        int childId
    )
    {
        try
        {
            var userId = GetUserId();
            var summary = await _practiceService.GetChildSummaryAsync(childId, userId);
            return Ok(summary);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting child summary for {ChildId}", childId);
            return StatusCode(500, new { error = "Failed to get summary" });
        }
    }

    [HttpGet("families/{familyId}/children-summary")]
    public async System.Threading.Tasks.Task<
        ActionResult<FamilyChildrenSummaryDto>
    > GetFamilyChildrenSummary(int familyId)
    {
        try
        {
            var userId = GetUserId();
            var summary = await _practiceService.GetFamilyChildrenSummaryAsync(familyId, userId);
            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting family children summary for {FamilyId}", familyId);
            return StatusCode(500, new { error = "Failed to get family summary" });
        }
    }

    [HttpGet("children/{childId}/achievements")]
    public async System.Threading.Tasks.Task<
        ActionResult<List<UserAchievementDto>>
    > GetChildAchievements(int childId)
    {
        try
        {
            var userId = GetUserId();
            var achievements = await _practiceService.GetChildAchievementsAsync(childId, userId);
            return Ok(achievements);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting achievements for {ChildId}", childId);
            return StatusCode(500, new { error = "Failed to get achievements" });
        }
    }

    [HttpGet("achievements")]
    public async System.Threading.Tasks.Task<
        ActionResult<List<AchievementDto>>
    > GetAvailableAchievements()
    {
        try
        {
            var achievements = await _practiceService.GetAvailableAchievementsAsync();
            return Ok(achievements);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting available achievements");
            return StatusCode(500, new { error = "Failed to get achievements" });
        }
    }

    [HttpGet("sessions/{sessionId}/review")]
    public async System.Threading.Tasks.Task<
        ActionResult<PracticeSessionReviewDto>
    > GetSessionReview(int sessionId)
    {
        try
        {
            var userId = GetUserId();
            var review = await _practiceService.GetSessionReviewAsync(sessionId, userId);
            return Ok(review);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting session review for {SessionId}", sessionId);
            return StatusCode(500, new { error = "Failed to get session review" });
        }
    }

    private System.Threading.Tasks.Task<PracticeSessionResponseDto> GetSession(int sessionId)
    {
        throw new NotImplementedException();
    }

    private System.Threading.Tasks.Task<PracticeAttemptResponseDto> GetAttempt(int attemptId)
    {
        throw new NotImplementedException();
    }

    private int GetUserId()
    {
        if (!HttpContext.Items.TryGetValue("UserId", out var userIdObj) || userIdObj == null)
        {
            if (HttpContext.Items.TryGetValue("UserSyncError", out var errorObj))
            {
                throw new InvalidOperationException("User sync failed: " + errorObj);
            }
            throw new InvalidOperationException("User context not available");
        }

        if (!int.TryParse(userIdObj.ToString(), out var userId) || userId == 0)
        {
            throw new InvalidOperationException("Invalid user ID");
        }

        return userId;
    }
}
