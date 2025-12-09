namespace FreelanceToolkit.Api.DTOs.Invoice;

public class CreateInvoiceDto
{
    public Guid ClientId { get; set; }
    public Guid? ProposalId { get; set; }
    public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    public List<InvoiceLineItemDto> LineItems { get; set; } = new();
    public decimal? TaxPercent { get; set; }
    public string? Notes { get; set; }
    public string? PaymentInstructions { get; set; }
}
