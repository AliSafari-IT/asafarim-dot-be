using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartOps.Api.DTOs;
using SmartOps.Api.Services;

namespace SmartOps.Api.Controllers;

/// <summary>
/// Devices API controller - CRUD operations for IoT devices
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DevicesController : ControllerBase
{
    private readonly IDeviceService _deviceService;
    private readonly IPermissionService _permissionService;
    private readonly IReadingService _readingService;
    private readonly ILogger<DevicesController> _logger;

    public DevicesController(
        IDeviceService deviceService,
        IPermissionService permissionService,
        IReadingService readingService,
        ILogger<DevicesController> logger
    )
    {
        _deviceService = deviceService;
        _permissionService = permissionService;
        _readingService = readingService;
        _logger = logger;
    }

    /// <summary>
    /// Get device summary (total, active, offline counts and recent readings)
    /// </summary>
    [HttpGet("summary")]
    [AllowAnonymous]
    public async Task<ActionResult<object>> GetSummary()
    {
        try
        {
            var summary = await _deviceService.GetSummaryAsync();
            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting device summary");
            return StatusCode(500, new { error = "Failed to retrieve device summary" });
        }
    }

    /// <summary>
    /// Get all devices with filtering and pagination
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<object>> GetDevices([FromQuery] DeviceFilterDto filter)
    {
        try
        {
            var (devices, total) = await _deviceService.GetDevicesAsync(filter);
            return Ok(
                new
                {
                    devices,
                    total,
                    page = filter.Page,
                    pageSize = filter.PageSize,
                }
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting devices");
            return StatusCode(500, new { error = "Failed to retrieve devices" });
        }
    }

    /// <summary>
    /// Get device by ID
    /// </summary>
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<DeviceDto>> GetDevice(Guid id)
    {
        try
        {
            var device = await _deviceService.GetDeviceByIdAsync(id);
            if (device == null)
                return NotFound(new { error = "Device not found" });

            return Ok(device);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting device {DeviceId}", id);
            return StatusCode(500, new { error = "Failed to retrieve device" });
        }
    }

    /// <summary>
    /// Create new device (Manager or Admin only)
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<DeviceDto>> CreateDevice([FromBody] CreateDeviceDto dto)
    {
        try
        {
            if (!_permissionService.CanManageDevices())
                return Forbid();

            var user = _permissionService.GetCurrentUser();
            var device = await _deviceService.CreateDeviceAsync(dto, user.UserId);

            return CreatedAtAction(nameof(GetDevice), new { id = device.Id }, device);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating device");
            return StatusCode(500, new { error = "Failed to create device" });
        }
    }

    /// <summary>
    /// Update device (Manager or Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<DeviceDto>> UpdateDevice(Guid id, [FromBody] UpdateDeviceDto dto)
    {
        try
        {
            if (!_permissionService.CanManageDevices())
                return Forbid();

            var device = await _deviceService.UpdateDeviceAsync(id, dto);
            return Ok(device);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Device not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating device {DeviceId}", id);
            return StatusCode(500, new { error = "Failed to update device" });
        }
    }

    /// <summary>
    /// Delete device (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteDevice(Guid id)
    {
        try
        {
            if (!_permissionService.IsAdmin())
                return Forbid();

            await _deviceService.DeleteDeviceAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Device not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting device {DeviceId}", id);
            return StatusCode(500, new { error = "Failed to delete device" });
        }
    }

    /// <summary>
    /// Seed database with sample readings for testing (Development only)
    /// </summary>
    [HttpPost("seed-readings")]
    [AllowAnonymous] // Temporarily allow anonymous for testing
    public async Task<ActionResult<object>> SeedReadings()
    {
        try
        {
            var devices = (
                await _deviceService.GetDevicesAsync(new DeviceFilterDto { PageSize = 1000 })
            ).devices;

            if (devices == null || !devices.Any())
            {
                return BadRequest(new { error = "No devices found in the database" });
            }

            var random = new Random();
            var readingsCreated = 0;
            var now = DateTime.UtcNow;

            foreach (var device in devices)
            {
                try
                {
                    for (int i = 0; i < 6; i++)
                    {
                        var reading = new CreateReadingDto
                        {
                            DeviceId = device.Id,
                            Temperature = Math.Round(20 + random.NextDouble() * 10, 1),
                            Humidity = Math.Round(35 + random.NextDouble() * 25, 1),
                            Pressure = Math.Round(980 + random.NextDouble() * 40, 1),
                            PowerConsumption = Math.Round(10 + random.NextDouble() * 15, 1),
                            OperationCount = random.Next(100, 1000),
                            RecordedAt = now.AddHours(-i * 4),
                        };

                        await _readingService.CreateReadingAsync(reading);
                        readingsCreated++;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error creating readings for device {device.Id}");
                    // Continue with next device
                }
            }

            return Ok(
                new
                {
                    message = $"Successfully seeded {readingsCreated} readings for {devices.Count} devices",
                    devicesCount = devices.Count,
                    readingsPerDevice = 6,
                    totalReadings = readingsCreated,
                }
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in SeedReadings");
            return StatusCode(500, new { error = ex.Message, details = ex.StackTrace });
        }
    }
}
