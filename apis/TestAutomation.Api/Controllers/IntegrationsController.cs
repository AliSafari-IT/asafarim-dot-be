using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestAutomation.Api.Data;
using TestAutomation.Api.Models;
using TestAutomation.Api.Services;

namespace TestAutomation.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/integrations")]
public class IntegrationsController : ControllerBase
{
    private readonly TestAutomationDbContext _db;
    private readonly ILogger<IntegrationsController> _logger;
    private readonly IEncryptionService _encryptionService;
    private readonly IGitHubActionsService _gitHubService;

    public IntegrationsController(
        TestAutomationDbContext db,
        ILogger<IntegrationsController> logger,
        IEncryptionService encryptionService,
        IGitHubActionsService gitHubService
    )
    {
        _db = db;
        _logger = logger;
        _encryptionService = encryptionService;
        _gitHubService = gitHubService;
    }

    private string GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("User ID not found");
    }

    // GET: api/integrations
    [HttpGet]
    public async Task<IActionResult> GetIntegrations([FromQuery] string? type = null)
    {
        var userId = GetUserId();
        var query = _db.Integrations.Where(i => i.UserId == userId);

        if (
            !string.IsNullOrEmpty(type)
            && Enum.TryParse<IntegrationType>(type, true, out var integrationType)
        )
        {
            query = query.Where(i => i.Type == integrationType);
        }

        var integrations = await query
            .OrderBy(i => i.Type)
            .ThenBy(i => i.Name)
            .Select(i => new
            {
                i.Id,
                i.Type,
                i.Name,
                i.Description,
                i.Status,
                i.LastSync,
                i.CreatedAt,
                i.UpdatedAt,
                // Don't expose credentials in list view
                HasCredentials = i.Credentials != null,
            })
            .ToListAsync();

        return Ok(integrations);
    }

    // GET: api/integrations/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetIntegration(int id)
    {
        var userId = GetUserId();
        var integration = await _db
            .Integrations.Where(i => i.Id == id && i.UserId == userId)
            .Select(i => new
            {
                i.Id,
                i.Type,
                i.Name,
                i.Description,
                i.Status,
                i.LastSync,
                i.Settings,
                i.CreatedAt,
                i.UpdatedAt,
                // Mask credentials for security
                HasCredentials = i.Credentials != null,
            })
            .FirstOrDefaultAsync();

        if (integration == null)
            return NotFound();

        return Ok(integration);
    }

    // POST: api/integrations
    [HttpPost]
    public async Task<IActionResult> CreateIntegration([FromBody] CreateIntegrationDto dto)
    {
        var userId = GetUserId();

        var integration = new Integration
        {
            UserId = userId,
            Type = dto.Type,
            Name = dto.Name,
            Description = dto.Description,
            Status = IntegrationStatus.Disconnected,
            Settings = dto.Settings != null ? JsonDocument.Parse(dto.Settings) : null,
        };

        _db.Integrations.Add(integration);
        await _db.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} created integration {IntegrationId} ({Name})",
            userId,
            integration.Id,
            integration.Name
        );

        return CreatedAtAction(
            nameof(GetIntegration),
            new { id = integration.Id },
            new
            {
                integration.Id,
                integration.Type,
                integration.Name,
                integration.Description,
                integration.Status,
                integration.CreatedAt,
            }
        );
    }

    // PUT: api/integrations/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateIntegration(int id, [FromBody] UpdateIntegrationDto dto)
    {
        var userId = GetUserId();
        var integration = await _db.Integrations.FirstOrDefaultAsync(i =>
            i.Id == id && i.UserId == userId
        );

        if (integration == null)
            return NotFound();

        if (!string.IsNullOrEmpty(dto.Name))
            integration.Name = dto.Name;

        if (!string.IsNullOrEmpty(dto.Description))
            integration.Description = dto.Description;

        if (dto.Settings != null)
            integration.Settings = JsonDocument.Parse(dto.Settings);

        integration.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        _logger.LogInformation("User {UserId} updated integration {IntegrationId}", userId, id);

        return NoContent();
    }

    // POST: api/integrations/{id}/connect
    [HttpPost("{id}/connect")]
    public async Task<IActionResult> ConnectIntegration(
        int id,
        [FromBody] ConnectIntegrationDto dto
    )
    {
        var userId = GetUserId();
        var integration = await _db.Integrations.FirstOrDefaultAsync(i =>
            i.Id == id && i.UserId == userId
        );

        if (integration == null)
            return NotFound();

        // For GitHub Actions, validate credentials before storing
        if (integration.Type == IntegrationType.CiCd && integration.Name == "GitHub Actions")
        {
            if (string.IsNullOrEmpty(dto.Credentials))
                return BadRequest("GitHub Actions requires credentials");

            try
            {
                _logger.LogInformation(
                    "Received GitHub credentials: {Credentials}",
                    dto.Credentials
                );

                var config = JsonSerializer.Deserialize<GitHubConfig>(dto.Credentials);
                _logger.LogInformation(
                    "Deserialized config - Repository: {Repository}, Token length: {TokenLength}",
                    config?.Repository ?? "null",
                    config?.Token?.Length ?? 0
                );

                if (
                    config == null
                    || string.IsNullOrEmpty(config.Repository)
                    || string.IsNullOrEmpty(config.Token)
                )
                    return BadRequest(
                        "Invalid GitHub configuration: repository and token are required"
                    );

                // Validate credentials with GitHub API
                var isValid = await _gitHubService.ValidateCredentialsAsync(
                    config.Repository,
                    config.Token
                );
                if (!isValid)
                    return BadRequest(
                        "Invalid GitHub credentials or insufficient permissions. Ensure your token has 'repo' and 'workflow' scopes."
                    );
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to deserialize GitHub configuration");
                return BadRequest("Invalid JSON format for GitHub configuration");
            }
        }

        // Store encrypted credentials
        if (dto.Credentials != null)
        {
            // Encrypt credentials before storing
            var encryptedCredentials = _encryptionService.Encrypt(dto.Credentials);
            integration.Credentials = JsonDocument.Parse(
                $"{{\"encrypted\":\"{encryptedCredentials}\"}}"
            );
        }

        integration.Status = IntegrationStatus.Connected;
        integration.LastSync = DateTime.UtcNow;
        integration.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} connected integration {IntegrationId} ({Name})",
            userId,
            id,
            integration.Name
        );

        return Ok(
            new { message = "Integration connected successfully", lastSync = integration.LastSync }
        );
    }

    // POST: api/integrations/{id}/disconnect
    [HttpPost("{id}/disconnect")]
    public async Task<IActionResult> DisconnectIntegration(int id)
    {
        var userId = GetUserId();
        var integration = await _db.Integrations.FirstOrDefaultAsync(i =>
            i.Id == id && i.UserId == userId
        );

        if (integration == null)
            return NotFound();

        integration.Status = IntegrationStatus.Disconnected;
        integration.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} disconnected integration {IntegrationId} ({Name})",
            userId,
            id,
            integration.Name
        );

        return Ok(new { message = "Integration disconnected successfully" });
    }

    // DELETE: api/integrations/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIntegration(int id)
    {
        var userId = GetUserId();
        var integration = await _db.Integrations.FirstOrDefaultAsync(i =>
            i.Id == id && i.UserId == userId
        );

        if (integration == null)
            return NotFound();

        _db.Integrations.Remove(integration);
        await _db.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} deleted integration {IntegrationId} ({Name})",
            userId,
            id,
            integration.Name
        );

        return NoContent();
    }

    // GET: api/integrations/stats
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var userId = GetUserId();
        var integrations = await _db.Integrations.Where(i => i.UserId == userId).ToListAsync();

        var stats = new
        {
            Total = integrations.Count,
            Active = integrations.Count(i => i.Status == IntegrationStatus.Connected),
            Inactive = integrations.Count(i => i.Status == IntegrationStatus.Disconnected),
            ByType = integrations
                .GroupBy(i => i.Type)
                .Select(g => new { Type = g.Key.ToString(), Count = g.Count() }),
        };

        return Ok(stats);
    }
}

// DTOs
public record CreateIntegrationDto(
    IntegrationType Type,
    string Name,
    string? Description,
    string? Settings
);

public record UpdateIntegrationDto(string? Name, string? Description, string? Settings);

public record ConnectIntegrationDto(string? Credentials);
