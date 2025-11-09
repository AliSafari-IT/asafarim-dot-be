using System.ComponentModel.DataAnnotations;

namespace TestAutomation.Api.Models;

public enum ReportFormat
{
    Html,
    Pdf,
    Json
}

public class NotificationSettings
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Send email notification on test success
    /// </summary>
    public bool EmailOnSuccess { get; set; } = false;

    /// <summary>
    /// Send email notification on test failure
    /// </summary>
    public bool EmailOnFailure { get; set; } = true;

    /// <summary>
    /// Enable Slack notifications
    /// </summary>
    public bool SlackEnabled { get; set; } = false;

    /// <summary>
    /// Slack webhook URL (encrypted)
    /// </summary>
    [MaxLength(500)]
    public string? SlackWebhookUrl { get; set; }

    /// <summary>
    /// Preferred report format
    /// </summary>
    public ReportFormat ReportFormat { get; set; } = ReportFormat.Html;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
