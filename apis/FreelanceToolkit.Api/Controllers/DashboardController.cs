using System.Security.Claims;
using FreelanceToolkit.Api.DTOs.Dashboard;
using FreelanceToolkit.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreelanceToolkit.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>
    /// Get comprehensive dashboard statistics
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<DashboardStatsDto>> GetStats()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var stats = await _dashboardService.GetStatsAsync(userId);
        return Ok(stats);
    }
}
