using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartOps.Api.DTOs;
using SmartOps.Api.Services;

namespace SmartOps.Api.Controllers;

/// <summary>
/// Readings API controller - metrics data from devices
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReadingsController : ControllerBase
{
    private readonly IReadingService _readingService;
    private readonly ILogger<ReadingsController> _logger;

    public ReadingsController(
        IReadingService readingService,
        ILogger<ReadingsController> logger)
    {
        _readingService = readingService;
        _logger = logger;
    }

    /// <summary>
    /// Get readings with filtering and pagination
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<object>> GetReadings([FromQuery] ReadingFilterDto filter)
    {
        try
        {
            var (readings, total) = await _readingService.GetReadingsAsync(filter);
            return Ok(new { readings, total, page = filter.Page, pageSize = filter.PageSize });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting readings");
            return StatusCode(500, new { error = "Failed to retrieve readings" });
        }
    }

    /// <summary>
    /// Get reading by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ReadingDto>> GetReading(Guid id)
    {
        try
        {
            var reading = await _readingService.GetReadingByIdAsync(id);
            if (reading == null)
                return NotFound(new { error = "Reading not found" });

            return Ok(reading);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting reading {ReadingId}", id);
            return StatusCode(500, new { error = "Failed to retrieve reading" });
        }
    }

    /// <summary>
    /// Get latest reading for a device
    /// </summary>
    [HttpGet("device/{deviceId}/latest")]
    public async Task<ActionResult<ReadingDto>> GetLatestReading(Guid deviceId)
    {
        try
        {
            var reading = await _readingService.GetLatestReadingAsync(deviceId);
            if (reading == null)
                return NotFound(new { error = "No readings found for device" });

            return Ok(reading);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting latest reading for device {DeviceId}", deviceId);
            return StatusCode(500, new { error = "Failed to retrieve reading" });
        }
    }

    /// <summary>
    /// Create new reading (from device or API)
    /// </summary>
    [HttpPost]
    [AllowAnonymous] // Allow devices to post readings without auth
    public async Task<ActionResult<ReadingDto>> CreateReading([FromBody] CreateReadingDto dto)
    {
        try
        {
            var reading = await _readingService.CreateReadingAsync(dto);
            return CreatedAtAction(nameof(GetReading), new { id = reading.Id }, reading);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating reading");
            return StatusCode(500, new { error = "Failed to create reading" });
        }
    }

    /// <summary>
    /// Get statistics for a device over time period
    /// </summary>
    [HttpGet("device/{deviceId}/stats")]
    public async Task<ActionResult<ReadingStatsDto>> GetStats(
        Guid deviceId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        try
        {
            if (startDate >= endDate)
                return BadRequest(new { error = "Start date must be before end date" });

            var stats = await _readingService.GetReadingStatsAsync(deviceId, startDate, endDate);
            return Ok(stats);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting reading stats for device {DeviceId}", deviceId);
            return StatusCode(500, new { error = "Failed to retrieve statistics" });
        }
    }
}
