namespace FreelanceToolkit.Api.DTOs.Invoice;

public class UpdateInvoiceDto
{
    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }
    public List<InvoiceLineItemDto> LineItems { get; set; } = new();
    public decimal? TaxPercent { get; set; }
    public string? Notes { get; set; }
    public string? PaymentInstructions { get; set; }
    public string Status { get; set; } = "Unpaid"; // Unpaid, Paid, Overdue, Cancelled
    public DateTime? PaidAt { get; set; }
}
