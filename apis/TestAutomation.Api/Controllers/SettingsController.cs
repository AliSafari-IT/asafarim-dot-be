using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestAutomation.Api.Data;
using TestAutomation.Api.Models;
using TestAutomation.Api.Services;

namespace TestAutomation.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/settings")]
public class SettingsController : ControllerBase
{
    private readonly TestAutomationDbContext _db;
    private readonly ILogger<SettingsController> _logger;
    private readonly IEncryptionService _encryptionService;

    public SettingsController(
        TestAutomationDbContext db,
        ILogger<SettingsController> logger,
        IEncryptionService encryptionService
    )
    {
        _db = db;
        _logger = logger;
        _encryptionService = encryptionService;
    }

    private string GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("User ID not found");
    }

    #region Environments

    // GET: api/settings/environments
    [HttpGet("environments")]
    public async Task<IActionResult> GetEnvironments()
    {
        var userId = GetUserId();
        var environments = await _db
            .TestEnvironments.Where(e => e.UserId == userId)
            .OrderByDescending(e => e.IsDefault)
            .ThenBy(e => e.Name)
            .ToListAsync();

        return Ok(environments);
    }

    // POST: api/settings/environments
    [HttpPost("environments")]
    public async Task<IActionResult> CreateEnvironment([FromBody] CreateEnvironmentDto dto)
    {
        var userId = GetUserId();

        // If this is set as default, unset other defaults
        if (dto.IsDefault)
        {
            var existingDefaults = await _db
                .TestEnvironments.Where(e => e.UserId == userId && e.IsDefault)
                .ToListAsync();

            foreach (var env in existingDefaults)
            {
                env.IsDefault = false;
            }
        }

        var environment = new TestEnvironment
        {
            UserId = userId,
            Name = dto.Name,
            BaseUrl = dto.BaseUrl,
            IsDefault = dto.IsDefault,
        };

        _db.TestEnvironments.Add(environment);
        await _db.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} created environment {EnvironmentId} ({Name})",
            userId,
            environment.Id,
            environment.Name
        );

        return CreatedAtAction(nameof(GetEnvironments), new { id = environment.Id }, environment);
    }

    // PUT: api/settings/environments/{id}
    [HttpPut("environments/{id}")]
    public async Task<IActionResult> UpdateEnvironment(int id, [FromBody] UpdateEnvironmentDto dto)
    {
        var userId = GetUserId();
        var environment = await _db.TestEnvironments.FirstOrDefaultAsync(e =>
            e.Id == id && e.UserId == userId
        );

        if (environment == null)
            return NotFound();

        if (!string.IsNullOrEmpty(dto.Name))
            environment.Name = dto.Name;

        if (!string.IsNullOrEmpty(dto.BaseUrl))
            environment.BaseUrl = dto.BaseUrl;

        environment.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        _logger.LogInformation("User {UserId} updated environment {EnvironmentId}", userId, id);

        return NoContent();
    }

    // POST: api/settings/environments/{id}/set-default
    [HttpPost("environments/{id}/set-default")]
    public async Task<IActionResult> SetDefaultEnvironment(int id)
    {
        var userId = GetUserId();

        // Unset all defaults
        var allEnvironments = await _db
            .TestEnvironments.Where(e => e.UserId == userId)
            .ToListAsync();

        foreach (var env in allEnvironments)
        {
            env.IsDefault = env.Id == id;
            env.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} set environment {EnvironmentId} as default",
            userId,
            id
        );

        return Ok(new { message = "Default environment updated" });
    }

    // DELETE: api/settings/environments/{id}
    [HttpDelete("environments/{id}")]
    public async Task<IActionResult> DeleteEnvironment(int id)
    {
        var userId = GetUserId();
        var environment = await _db.TestEnvironments.FirstOrDefaultAsync(e =>
            e.Id == id && e.UserId == userId
        );

        if (environment == null)
            return NotFound();

        _db.TestEnvironments.Remove(environment);
        await _db.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} deleted environment {EnvironmentId} ({Name})",
            userId,
            id,
            environment.Name
        );

        return NoContent();
    }

    #endregion

    #region Credentials

    // GET: api/settings/credentials
    [HttpGet("credentials")]
    public async Task<IActionResult> GetCredentials()
    {
        var userId = GetUserId();
        var credentials = await _db
            .UserCredentials.Where(c => c.UserId == userId)
            .OrderBy(c => c.Name)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Type,
                c.LastUsed,
                c.CreatedAt,
                c.UpdatedAt,
                // Mask the actual value
                Value = "••••••••••••",
            })
            .ToListAsync();

        return Ok(credentials);
    }

    // POST: api/settings/credentials
    [HttpPost("credentials")]
    public async Task<IActionResult> CreateCredential([FromBody] CreateCredentialDto dto)
    {
        var userId = GetUserId();

        // Encrypt the credential value before storing
        var encryptedValue = _encryptionService.Encrypt(dto.Value);

        var credential = new UserCredential
        {
            UserId = userId,
            Name = dto.Name,
            Type = dto.Type,
            EncryptedValue = encryptedValue,
        };

        _db.UserCredentials.Add(credential);
        await _db.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} created credential {CredentialId} ({Name})",
            userId,
            credential.Id,
            credential.Name
        );

        return CreatedAtAction(
            nameof(GetCredentials),
            new { id = credential.Id },
            new
            {
                credential.Id,
                credential.Name,
                credential.Type,
                credential.CreatedAt,
                Value = "••••••••••••",
            }
        );
    }

    // PUT: api/settings/credentials/{id}
    [HttpPut("credentials/{id}")]
    public async Task<IActionResult> UpdateCredential(int id, [FromBody] UpdateCredentialDto dto)
    {
        var userId = GetUserId();
        var credential = await _db.UserCredentials.FirstOrDefaultAsync(c =>
            c.Id == id && c.UserId == userId
        );

        if (credential == null)
            return NotFound();

        if (!string.IsNullOrEmpty(dto.Name))
            credential.Name = dto.Name;

        if (dto.Type.HasValue)
            credential.Type = dto.Type.Value;

        if (!string.IsNullOrEmpty(dto.Value))
            credential.EncryptedValue = _encryptionService.Encrypt(dto.Value);

        credential.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        _logger.LogInformation("User {UserId} updated credential {CredentialId}", userId, id);

        return NoContent();
    }

    // DELETE: api/settings/credentials/{id}
    [HttpDelete("credentials/{id}")]
    public async Task<IActionResult> DeleteCredential(int id)
    {
        var userId = GetUserId();
        var credential = await _db.UserCredentials.FirstOrDefaultAsync(c =>
            c.Id == id && c.UserId == userId
        );

        if (credential == null)
            return NotFound();

        _db.UserCredentials.Remove(credential);
        await _db.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} deleted credential {CredentialId} ({Name})",
            userId,
            id,
            credential.Name
        );

        return NoContent();
    }

    #endregion

    #region Automation Settings

    // GET: api/settings/automation
    [HttpGet("automation")]
    public async Task<IActionResult> GetAutomationSettings()
    {
        var userId = GetUserId();
        var settings = await _db.AutomationSettings.FirstOrDefaultAsync(s => s.UserId == userId);

        // Return default settings if none exist
        if (settings == null)
        {
            settings = new AutomationSettings { UserId = userId };
        }

        return Ok(settings);
    }

    // PUT: api/settings/automation
    [HttpPut("automation")]
    public async Task<IActionResult> UpdateAutomationSettings(
        [FromBody] UpdateAutomationSettingsDto dto
    )
    {
        var userId = GetUserId();
        var settings = await _db.AutomationSettings.FirstOrDefaultAsync(s => s.UserId == userId);

        if (settings == null)
        {
            settings = new AutomationSettings { UserId = userId };
            _db.AutomationSettings.Add(settings);
        }

        settings.DefaultTimeout = dto.DefaultTimeout;
        settings.MaxRetries = dto.MaxRetries;
        settings.Parallelism = dto.Parallelism;
        settings.ScreenshotOnFailure = dto.ScreenshotOnFailure;
        settings.VideoRecording = dto.VideoRecording;
        settings.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        _logger.LogInformation("User {UserId} updated automation settings", userId);

        return Ok(settings);
    }

    #endregion

    #region Notification Settings

    // GET: api/settings/notifications
    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotificationSettings()
    {
        var userId = GetUserId();
        var settings = await _db.NotificationSettings.FirstOrDefaultAsync(s => s.UserId == userId);

        // Return default settings if none exist
        if (settings == null)
        {
            settings = new NotificationSettings { UserId = userId };
        }

        return Ok(settings);
    }

    // PUT: api/settings/notifications
    [HttpPut("notifications")]
    public async Task<IActionResult> UpdateNotificationSettings(
        [FromBody] UpdateNotificationSettingsDto dto
    )
    {
        var userId = GetUserId();
        var settings = await _db.NotificationSettings.FirstOrDefaultAsync(s => s.UserId == userId);

        if (settings == null)
        {
            settings = new NotificationSettings { UserId = userId };
            _db.NotificationSettings.Add(settings);
        }

        settings.EmailOnSuccess = dto.EmailOnSuccess;
        settings.EmailOnFailure = dto.EmailOnFailure;
        settings.SlackEnabled = dto.SlackEnabled;
        settings.SlackWebhookUrl = dto.SlackWebhookUrl;
        settings.ReportFormat = dto.ReportFormat;
        settings.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        _logger.LogInformation("User {UserId} updated notification settings", userId);

        return Ok(settings);
    }

    #endregion
}

// DTOs
public record CreateEnvironmentDto(string Name, string BaseUrl, bool IsDefault = false);

public record UpdateEnvironmentDto(string? Name, string? BaseUrl);

public record CreateCredentialDto(string Name, CredentialType Type, string Value);

public record UpdateCredentialDto(string? Name, CredentialType? Type, string? Value);

public record UpdateAutomationSettingsDto(
    int DefaultTimeout,
    int MaxRetries,
    int Parallelism,
    bool ScreenshotOnFailure,
    bool VideoRecording
);

public record UpdateNotificationSettingsDto(
    bool EmailOnSuccess,
    bool EmailOnFailure,
    bool SlackEnabled,
    string? SlackWebhookUrl,
    ReportFormat ReportFormat
);
