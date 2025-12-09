namespace FreelanceToolkit.Api.Models;

public class ProposalTemplate
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty; // Markdown or HTML
    public bool IsDefault { get; set; }
    public int Version { get; set; } = 1;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Foreign key - references user ID from Identity.Api
    public string UserId { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<Proposal> Proposals { get; set; } = new List<Proposal>();
}
