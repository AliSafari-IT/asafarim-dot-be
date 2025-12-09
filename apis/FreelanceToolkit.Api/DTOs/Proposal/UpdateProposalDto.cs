namespace FreelanceToolkit.Api.DTOs.Proposal;

public class UpdateProposalDto
{
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public DateTime? ValidUntil { get; set; }
    public List<ProposalLineItemDto> LineItems { get; set; } = new();
    public decimal? TaxPercent { get; set; }
    public string? Terms { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = "Draft"; // Draft, Sent, Accepted, Rejected
}
