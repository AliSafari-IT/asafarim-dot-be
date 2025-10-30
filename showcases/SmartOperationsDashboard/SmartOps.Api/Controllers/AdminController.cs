using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOps.Api.Data;
using SmartOps.Api.DTOs;
using SmartOps.Api.Models;
using SmartOps.Api.Services;

namespace SmartOps.Api.Controllers;

/// <summary>
/// Admin API controller - User permission management
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly SmartOpsDbContext _dbContext;
    private readonly ILogger<AdminController> _logger;
    private readonly IDeviceService _deviceService;
    private readonly IReadingService _readingService;

    public AdminController(
        SmartOpsDbContext dbContext,
        ILogger<AdminController> logger,
        IDeviceService deviceService,
        IReadingService readingService
    )
    {
        _dbContext = dbContext;
        _logger = logger;
        _deviceService = deviceService;
        _readingService = readingService;
    }

    /// <summary>
    /// Seed test data - Creates devices if needed, then appends new readings for rich historical data
    /// </summary>
    [HttpPost("seed-test-data")]
    public async Task<IActionResult> SeedTestData()
    {
        try
        {
            var createdDevices = 0;
            var createdReadings = 0;

            // Get current user ID from claims (or use a default)
            var userIdClaim =
                User.FindFirst("sub")
                ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            var userId = userIdClaim != null ? Guid.Parse(userIdClaim.Value) : Guid.Empty;

            // Define test device configurations
            var deviceConfigs = new[]
            {
                new
                {
                    SerialNumber = "HVAC-001-TEST-001",
                    Name = "HVAC-001",
                    Type = "HVAC",
                    Location = "Floor 1 - East Wing",
                    Description = "Test HVAC system for demonstration",
                    Status = DeviceStatus.Online,
                },
                new
                {
                    SerialNumber = "GEN-001-TEST-001",
                    Name = "Generator-001",
                    Type = "Generator",
                    Location = "Basement - Power Room",
                    Description = "Test backup generator for demonstration",
                    Status = DeviceStatus.Online,
                },
                new
                {
                    SerialNumber = "LIGHT-001-TEST-001",
                    Name = "Lighting-001",
                    Type = "Lighting",
                    Location = "Floor 2 - West Wing",
                    Description = "Test lighting control system for demonstration",
                    Status = DeviceStatus.Offline,
                },
            };

            // Create devices if they don't exist, or get existing ones
            var testDevices = new List<Device>();
            foreach (var config in deviceConfigs)
            {
                var existingDevice = await _dbContext.Devices.FirstOrDefaultAsync(d =>
                    d.SerialNumber == config.SerialNumber
                );

                if (existingDevice == null)
                {
                    var newDevice = new Device
                    {
                        Id = Guid.NewGuid(),
                        Name = config.Name,
                        Type = config.Type,
                        SerialNumber = config.SerialNumber,
                        Location = config.Location,
                        Description = config.Description,
                        Status = config.Status,
                        LastSeen =
                            config.Status == DeviceStatus.Online
                                ? DateTime.UtcNow
                                : DateTime.UtcNow.AddHours(-2),
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        CreatedBy = userId,
                    };
                    _dbContext.Devices.Add(newDevice);
                    testDevices.Add(newDevice);
                    createdDevices++;
                }
                else
                {
                    // Update existing device status and last seen
                    existingDevice.Status = config.Status;
                    existingDevice.LastSeen =
                        config.Status == DeviceStatus.Online
                            ? DateTime.UtcNow
                            : DateTime.UtcNow.AddHours(-2);
                    existingDevice.UpdatedAt = DateTime.UtcNow;
                    testDevices.Add(existingDevice);
                }
            }

            await _dbContext.SaveChangesAsync();

            // Append new readings starting from the latest existing reading (or 7 days ago if none)
            var random = new Random();
            var now = DateTime.UtcNow;
            var allReadings = new List<Reading>();

            _logger.LogInformation(
                "Starting reading generation for {DeviceCount} devices",
                testDevices.Count
            );

            foreach (var device in testDevices)
            {
                _logger.LogInformation(
                    "Generating readings for device: {DeviceId} - {DeviceType}",
                    device.Id,
                    device.Type
                );

                // Always generate new readings for the last 24 hours
                var startDate = now.AddHours(-24);
                _logger.LogInformation(
                    "Generating readings from {StartDate} to {EndDate}",
                    startDate,
                    now
                );

                // Generate readings for the last 24 hours
                var readingCount = 0;
                for (var date = startDate; date <= now; date = date.AddHours(1))
                {
                    readingCount++;
                    // Generate realistic readings based on device type and time of day
                    var hour = date.Hour;
                    var isDayTime = hour > 6 && hour < 20;

                    // Base values with daily patterns
                    double baseTemp,
                        baseHumidity,
                        basePower;

                    if (device.Type == "HVAC")
                    {
                        baseTemp = isDayTime
                            ? 22 + (Math.Sin(hour * 0.2) * 3)
                            : 18 + (Math.Sin(hour * 0.2) * 2);
                        baseHumidity = 45 + (Math.Sin(hour * 0.3) * 10); // 35-55%
                        basePower = isDayTime ? 250 : 150; // Higher power during day
                    }
                    else if (device.Type == "Generator")
                    {
                        baseTemp = 30 + (Math.Sin(hour * 0.4) * 5); // 25-35°C
                        baseHumidity = 40 + (Math.Sin(hour * 0.2) * 15); // 25-55%
                        basePower = isDayTime
                            ? 180 + (Math.Sin(hour * 0.5) * 50)
                            : 100 + (Math.Sin(hour * 0.3) * 30);
                    }
                    else // Lighting
                    {
                        baseTemp = 25 + (Math.Sin(hour * 0.3) * 4); // 21-29°C
                        baseHumidity = 50 + (Math.Sin(hour * 0.25) * 20); // 30-70%
                        basePower = isDayTime
                            ? 120 + (Math.Sin(hour * 0.4) * 40)
                            : 50 + (Math.Sin(hour * 0.2) * 20);
                    }

                    // Add random noise (±10% of base value)
                    double randomFactor = 1.0 + ((random.NextDouble() * 0.2) - 0.1); // 0.9 to 1.1

                    var reading = new Reading
                    {
                        Id = Guid.NewGuid(),
                        DeviceId = device.Id,
                        Temperature = Math.Round(baseTemp * randomFactor, 1),
                        Humidity = Math.Round(Math.Clamp(baseHumidity * randomFactor, 20, 90), 1),
                        PowerConsumption = Math.Round(basePower * randomFactor, 2),
                        OperationCount = random.Next(100, 1200),
                        RecordedAt = date,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = userId,
                    };

                    // Ensure values stay within realistic bounds
                    reading.Temperature = Math.Clamp(reading.Temperature, 15, 40);
                    reading.Humidity = Math.Clamp(reading.Humidity, 20, 90);
                    reading.PowerConsumption = Math.Max(0, reading.PowerConsumption);

                    allReadings.Add(reading);
                    createdReadings++;

                    _logger.LogInformation(
                        "Generated {ReadingCount} readings for device {DeviceId}",
                        readingCount,
                        device.Id
                    );
                }
            }

            if (allReadings.Any())
            {
                _dbContext.Readings.AddRange(allReadings);
                await _dbContext.SaveChangesAsync();
                createdReadings = allReadings.Count;
            }

            // Get total counts for informative response
            var totalDevices = testDevices.Count;
            var totalReadings = await _dbContext
                .Readings.Where(r => testDevices.Select(d => d.Id).Contains(r.DeviceId))
                .CountAsync();

            _logger.LogInformation(
                "Test data seeded: {NewDevices} new devices, {NewReadings} new readings appended. Total: {TotalDevices} devices, {TotalReadings} readings",
                createdDevices,
                createdReadings,
                totalDevices,
                totalReadings
            );

            return Ok(
                new
                {
                    message = createdDevices > 0
                        ? $"Created {createdDevices} new devices and added {createdReadings} readings"
                        : $"Added {createdReadings} new readings to existing devices",
                    newDevices = createdDevices,
                    newReadings = createdReadings,
                    totalDevices = totalDevices,
                    totalReadings = totalReadings,
                }
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding test data: {Message}", ex.Message);
            return StatusCode(500, new { error = $"Failed to seed test data: {ex.Message}" });
        }
    }

    /// <summary>
    /// Clear test data (only removes devices with test serial numbers)
    /// </summary>
    [HttpDelete("clear-test-data")]
    public async Task<IActionResult> ClearTestData()
    {
        try
        {
            var deletedReadings = 0;
            var deletedDevices = 0;

            // Define test device serial numbers
            var testSerialNumbers = new[]
            {
                "HVAC-001-TEST-001",
                "GEN-001-TEST-001",
                "LIGHT-001-TEST-001",
            };

            // Find test devices
            var testDevices = await _dbContext
                .Devices.Where(d => testSerialNumbers.Contains(d.SerialNumber))
                .ToListAsync();

            if (testDevices.Any())
            {
                var deviceIds = testDevices.Select(d => d.Id).ToList();

                // Delete readings associated with test devices first (foreign key constraint)
                var readings = await _dbContext
                    .Readings.Where(r => deviceIds.Contains(r.DeviceId))
                    .ToListAsync();

                _dbContext.Readings.RemoveRange(readings);
                deletedReadings = readings.Count;

                // Delete test devices
                _dbContext.Devices.RemoveRange(testDevices);
                deletedDevices = testDevices.Count;

                await _dbContext.SaveChangesAsync();

                _logger.LogInformation(
                    "Test data cleared successfully: {DeviceCount} devices, {ReadingCount} readings",
                    deletedDevices,
                    deletedReadings
                );
            }
            else
            {
                _logger.LogInformation("No test data found to clear");
            }

            return Ok(
                new
                {
                    message = deletedDevices > 0
                        ? "Test data cleared successfully"
                        : "No test data found to clear",
                    devices = deletedDevices,
                    readings = deletedReadings,
                }
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing test data: {Message}", ex.Message);
            return StatusCode(500, new { error = $"Failed to clear test data: {ex.Message}" });
        }
    }

    /// <summary>
    /// Get all user permissions
    /// </summary>
    [HttpGet("users")]
    public async Task<ActionResult<object>> GetAllUsers()
    {
        try
        {
            var users = await _dbContext.UserPermissions.OrderBy(u => u.CreatedAt).ToListAsync();

            var result = users.Select(u => new
            {
                u.Id,
                u.AppUserId,
                u.Role,
                u.IsActive,
                u.CreatedAt,
                u.UpdatedAt,
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users");
            return StatusCode(500, new { error = "Failed to retrieve users" });
        }
    }

    /// <summary>
    /// Get user permission by ID
    /// </summary>
    [HttpGet("users/{userId:guid}")]
    public async Task<ActionResult<object>> GetUser(Guid userId)
    {
        try
        {
            var user = await _dbContext.UserPermissions.FirstOrDefaultAsync(u =>
                u.AppUserId == userId
            );

            if (user == null)
                return NotFound(new { error = "User not found" });

            return Ok(
                new
                {
                    user.Id,
                    user.AppUserId,
                    user.Role,
                    user.IsActive,
                    user.CreatedAt,
                    user.UpdatedAt,
                }
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user {UserId}", userId);
            return StatusCode(500, new { error = "Failed to retrieve user" });
        }
    }

    /// <summary>
    /// Create or update user permission
    /// </summary>
    [HttpPost("users")]
    public async Task<ActionResult<object>> CreateOrUpdateUserPermission(
        [FromBody] CreateUserPermissionDto dto
    )
    {
        try
        {
            if (!Enum.TryParse<UserRole>(dto.Role, true, out var role))
                return BadRequest(
                    new { error = "Invalid role. Must be Member, Manager, or Admin" }
                );

            var existing = await _dbContext.UserPermissions.FirstOrDefaultAsync(u =>
                u.AppUserId == dto.AppUserId
            );

            if (existing != null)
            {
                existing.Role = role;
                existing.IsActive = dto.IsActive ?? true;
                existing.UpdatedAt = DateTime.UtcNow;
                _dbContext.UserPermissions.Update(existing);
            }
            else
            {
                var userPermission = new UserPermission
                {
                    Id = Guid.NewGuid(),
                    AppUserId = dto.AppUserId,
                    Role = role,
                    IsActive = dto.IsActive ?? true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };
                _dbContext.UserPermissions.Add(userPermission);
            }

            await _dbContext.SaveChangesAsync();

            var result =
                existing
                ?? new UserPermission
                {
                    Id = Guid.NewGuid(),
                    AppUserId = dto.AppUserId,
                    Role = role,
                    IsActive = dto.IsActive ?? true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };

            return Ok(
                new
                {
                    result.Id,
                    result.AppUserId,
                    Role = result.Role.ToString(),
                    result.IsActive,
                    result.CreatedAt,
                    result.UpdatedAt,
                }
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating/updating user permission");
            return StatusCode(500, new { error = "Failed to create/update user permission" });
        }
    }

    /// <summary>
    /// Update user permission
    /// </summary>
    [HttpPut("users/{userId:guid}")]
    public async Task<ActionResult<object>> UpdateUserPermission(
        Guid userId,
        [FromBody] UpdateUserPermissionDto dto
    )
    {
        try
        {
            if (!Enum.TryParse<UserRole>(dto.Role, true, out var role))
                return BadRequest(
                    new { error = "Invalid role. Must be Member, Manager, or Admin" }
                );

            var user = await _dbContext.UserPermissions.FirstOrDefaultAsync(u =>
                u.AppUserId == userId
            );

            if (user == null)
                return NotFound(new { error = "User not found" });

            user.Role = role;
            user.IsActive = dto.IsActive ?? user.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

            _dbContext.UserPermissions.Update(user);
            await _dbContext.SaveChangesAsync();

            return Ok(
                new
                {
                    user.Id,
                    user.AppUserId,
                    Role = user.Role.ToString(),
                    user.IsActive,
                    user.CreatedAt,
                    user.UpdatedAt,
                }
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user permission {UserId}", userId);
            return StatusCode(500, new { error = "Failed to update user permission" });
        }
    }

    /// <summary>
    /// Delete user permission
    /// </summary>
    [HttpDelete("users/{userId:guid}")]
    public async Task<IActionResult> DeleteUserPermission(Guid userId)
    {
        try
        {
            var user = await _dbContext.UserPermissions.FirstOrDefaultAsync(u =>
                u.AppUserId == userId
            );

            if (user == null)
                return NotFound(new { error = "User not found" });

            _dbContext.UserPermissions.Remove(user);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user permission {UserId}", userId);
            return StatusCode(500, new { error = "Failed to delete user permission" });
        }
    }
}
