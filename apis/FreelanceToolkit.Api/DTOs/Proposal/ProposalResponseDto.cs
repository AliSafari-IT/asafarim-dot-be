namespace FreelanceToolkit.Api.DTOs.Proposal;

public class ProposalResponseDto
{
    public Guid Id { get; set; }
    public string ProposalNumber { get; set; } = default!;
    public Guid ClientId { get; set; }
    public string ClientName { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string? ProjectScope { get; set; }
    public string Status { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public DateTime? ValidUntil { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public DateTime? RejectedAt { get; set; }
    public List<ProposalLineItemDto> LineItems { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public string? Disclaimer { get; set; }
}
