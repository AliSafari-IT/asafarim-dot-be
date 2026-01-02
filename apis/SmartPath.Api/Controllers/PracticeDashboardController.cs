using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartPath.Api.DTOs;
using SmartPath.Api.Services;

namespace SmartPath.Api.Controllers;

[ApiController]
[Route("api/practice-dashboard")]
[Authorize(Roles = "familyManager,admin")]
public class PracticeDashboardController : ControllerBase
{
    private readonly IPracticeItemService _itemService;
    private readonly ILogger<PracticeDashboardController> _logger;

    public PracticeDashboardController(
        IPracticeItemService itemService,
        ILogger<PracticeDashboardController> logger
    )
    {
        _itemService = itemService;
        _logger = logger;
    }

    [HttpGet("families/{familyId}")]
    public async System.Threading.Tasks.Task<ActionResult<PracticeDashboardDto>> GetFamilyDashboard(
        int familyId
    )
    {
        try
        {
            var userId = GetUserId();
            var dashboard = await _itemService.GetFamilyDashboardAsync(familyId, userId);
            return Ok(dashboard);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting family dashboard for {FamilyId}", familyId);
            return StatusCode(500, new { error = "Failed to get dashboard" });
        }
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
