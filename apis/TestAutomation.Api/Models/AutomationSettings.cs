using System.ComponentModel.DataAnnotations;

namespace TestAutomation.Api.Models;

public class AutomationSettings
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Default timeout in milliseconds
    /// </summary>
    public int DefaultTimeout { get; set; } = 30000;

    /// <summary>
    /// Maximum number of retries for failed tests
    /// </summary>
    public int MaxRetries { get; set; } = 3;

    /// <summary>
    /// Number of parallel test executions
    /// </summary>
    public int Parallelism { get; set; } = 4;

    /// <summary>
    /// Capture screenshot on test failure
    /// </summary>
    public bool ScreenshotOnFailure { get; set; } = true;

    /// <summary>
    /// Record video during test execution
    /// </summary>
    public bool VideoRecording { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
