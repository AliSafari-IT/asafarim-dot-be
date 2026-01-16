using System.Text.Json;
using Core.Api.Models.Common;

namespace Core.Api.Models.Resume;

public class PortfolioSettings : BaseEntity
{
    public Guid UserId { get; set; }

    public string PublicSlug { get; set; } = string.Empty;

    public bool IsPublic { get; set; } = true;

    public string? Theme { get; set; }

    // PortfolioSettings holds per-user portfolio configuration and public slug.
    // SectionOrderJson stores layout order as JSON (flexible).
    public string SectionOrderJson { get; set; } = string.Empty;

    // Convenience accessors
    public string[] GetSectionOrder() =>
        string.IsNullOrWhiteSpace(SectionOrderJson)
            ? Array.Empty<string>()
            : JsonSerializer.Deserialize<string[]>(SectionOrderJson) ?? Array.Empty<string>();

    public void SetSectionOrder(string[] order) =>
        SectionOrderJson = JsonSerializer.Serialize(order);
}
