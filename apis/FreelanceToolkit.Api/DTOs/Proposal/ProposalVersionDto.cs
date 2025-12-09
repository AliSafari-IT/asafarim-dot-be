namespace FreelanceToolkit.Api.DTOs.Proposal;

public class ProposalVersionDto
{
    public Guid Id { get; set; }
    public int VersionNumber { get; set; }
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public List<ProposalLineItemDto> LineItems { get; set; } = new();
    public decimal Subtotal { get; set; }
    public decimal? TaxPercent { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }
    public string? Terms { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}
