using System.Net.Http.Json;
using System.Net.Sockets;

namespace Identity.Api.Services;

/// <summary>
/// Service to fetch roles from SmartOps API and merge with Identity API roles
/// </summary>
public interface ISmartOpsRoleService
{
    Task<IEnumerable<string>> GetMergedRolesAsync(Guid userId);
}

public class SmartOpsRoleService : ISmartOpsRoleService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<SmartOpsRoleService> _logger;
    private const string SmartOpsApiUrl = "http://smartops.asafarim.local:5105";
    private static readonly TimeSpan DefaultTimeout = TimeSpan.FromSeconds(5);

    public SmartOpsRoleService(HttpClient httpClient, ILogger<SmartOpsRoleService> logger)
    {
        _httpClient = httpClient;
        _httpClient.Timeout = DefaultTimeout;
        _logger = logger;
    }

    /// <summary>
    /// Get merged roles from both Identity API and SmartOps API
    /// SmartOps roles take precedence if they exist
    /// </summary>
    public async Task<IEnumerable<string>> GetMergedRolesAsync(Guid userId)
    {
        var roles = new HashSet<string>();

        try
        {
            // Fetch SmartOps role for this user
            var smartOpsRole = await GetSmartOpsRoleAsync(userId);
            if (!string.IsNullOrEmpty(smartOpsRole))
            {
                roles.Add(smartOpsRole);
                _logger.LogInformation(
                    "Fetched SmartOps role {Role} for user {UserId}",
                    smartOpsRole,
                    userId
                );
            }
        }
        catch (HttpRequestException ex) when (ex.InnerException is SocketException || ex.InnerException is TaskCanceledException)
        {
            _logger.LogWarning(ex, "SmartOps API is unreachable or timed out for user {UserId}", userId);
            // Continue without SmartOps role - not critical
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch SmartOps role for user {UserId}", userId);
            // Continue without SmartOps role - not critical
        }

        return roles;
    }

    /// <summary>
    /// Fetch user's role from SmartOps API
    /// </summary>
    private async Task<string?> GetSmartOpsRoleAsync(Guid userId)
    {
        try
        {
            var endpoint = $"{SmartOpsApiUrl}/api/admin/users/{userId}";
            var response = await _httpClient.GetAsync(endpoint);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogDebug(
                    "SmartOps API returned {StatusCode} for user {UserId}",
                    response.StatusCode,
                    userId
                );
                return null;
            }

            var json = await response.Content.ReadAsStringAsync();
            var data = System.Text.Json.JsonSerializer.Deserialize<SmartOpsUserDto>(json);
            return data?.Role;
        }
        catch (HttpRequestException ex) when (ex.InnerException is SocketException || ex.InnerException is TaskCanceledException)
        {
            _logger.LogWarning(ex, "Error fetching SmartOps role for user {UserId}: SmartOps API is unreachable or timed out", userId);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error fetching SmartOps role for user {UserId}", userId);
            return null;
        }
    }

    private class SmartOpsUserDto
    {
        public Guid Id { get; set; }
        public Guid AppUserId { get; set; }
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
