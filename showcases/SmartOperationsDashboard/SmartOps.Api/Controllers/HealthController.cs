using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartOps.Api.Data;

namespace SmartOps.Api.Controllers;

/// <summary>
/// Health check endpoint
/// </summary>
[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class HealthController : ControllerBase
{
    private readonly SmartOpsDbContext _dbContext;

    public HealthController(SmartOpsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Health check endpoint
    /// </summary>
    [HttpGet]
    public IActionResult Health()
    {
        try
        {
            var deviceCount = _dbContext.Devices.Count();
            var readingCount = _dbContext.Readings.Count();

            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                database = new { devices = deviceCount, readings = readingCount }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(503, new { status = "unhealthy", error = ex.Message });
        }
    }
}
