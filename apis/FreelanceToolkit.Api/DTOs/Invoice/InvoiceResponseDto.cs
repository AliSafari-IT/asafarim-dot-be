namespace FreelanceToolkit.Api.DTOs.Invoice;

public class InvoiceResponseDto
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = default!;
    public Guid ClientId { get; set; }
    public string ClientName { get; set; } = default!;
    public Guid? ProposalId { get; set; }
    public string? ProposalNumber { get; set; }
    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }
    public string Status { get; set; } = default!;
    public DateTime? PaidAt { get; set; }
    public List<InvoiceLineItemDto> LineItems { get; set; } = new();
    public decimal Subtotal { get; set; }
    public decimal? TaxPercent { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }
    public string? Notes { get; set; }
    public string? PaymentInstructions { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsOverdue => Status == "Unpaid" && DueDate < DateTime.UtcNow;
}
