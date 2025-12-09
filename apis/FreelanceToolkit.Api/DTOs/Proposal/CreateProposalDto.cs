namespace FreelanceToolkit.Api.DTOs.Proposal;

public class CreateProposalDto
{
    public Guid ClientId { get; set; }
    public Guid? TemplateId { get; set; }
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public DateTime? ValidUntil { get; set; }
    public List<ProposalLineItemDto> LineItems { get; set; } = new();
    public decimal? TaxPercent { get; set; }
    public string? Terms { get; set; }
    public string? Notes { get; set; }
}
