using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace TestAutomation.Api.Models;

public enum IntegrationType
{
    CiCd,
    IssueTracker,
    Notification,
    Api,
}

public enum IntegrationStatus
{
    Connected,
    Disconnected,
}

public class Integration
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    public IntegrationType Type { get; set; }

    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Required]
    public IntegrationStatus Status { get; set; } = IntegrationStatus.Disconnected;

    /// <summary>
    /// Encrypted credentials/tokens stored as JSON
    /// </summary>
    public JsonDocument? Credentials { get; set; }

    public DateTime? LastSync { get; set; }

    /// <summary>
    /// Custom settings per integration stored as JSON
    /// </summary>
    public JsonDocument? Settings { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Parses GitHub Actions configuration from stored credentials
    /// </summary>
    public GitHubConfig? GetGitHubConfig()
    {
        if (Type != IntegrationType.CiCd || Credentials == null)
            return null;

        try
        {
            return JsonSerializer.Deserialize<GitHubConfig>(Credentials.RootElement.GetRawText());
        }
        catch
        {
            return null;
        }
    }
}

/// <summary>
/// GitHub Actions configuration for triggering workflows
/// </summary>
public class GitHubConfig
{
    [System.Text.Json.Serialization.JsonPropertyName("repository")]
    public string Repository { get; set; } = string.Empty; // owner/repo

    [System.Text.Json.Serialization.JsonPropertyName("workflowPath")]
    public string WorkflowPath { get; set; } = string.Empty; // .github/workflows/test.yml

    [System.Text.Json.Serialization.JsonPropertyName("token")]
    public string Token { get; set; } = string.Empty; // GitHub personal access token
}
