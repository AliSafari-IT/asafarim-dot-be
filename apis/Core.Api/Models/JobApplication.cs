using Core.Api.Models.Common;

namespace Core.Api.Models;

public class JobApplication : BaseEntity
{
    public string UserId { get; set; } = string.Empty;

    public string Company { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public string? Location { get; set; }

    public string? City { get; set; }

    public string Status { get; set; } = "Applied";

    public DateTime AppliedDate { get; set; } = DateTime.UtcNow;

    public string? Notes { get; set; }
}
