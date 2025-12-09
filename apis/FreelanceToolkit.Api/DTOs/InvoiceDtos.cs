using FreelanceToolkit.Api.Models;

namespace FreelanceToolkit.Api.DTOs;

public class InvoiceDto
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }
    public decimal SubTotal { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }
    public string Currency { get; set; } = "EUR";
    public InvoiceStatus Status { get; set; }
    public string? Notes { get; set; }
    public string? PaymentLink { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public PaymentMethod? PaymentMethod { get; set; }
    public string? TransactionId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public Guid? ProposalId { get; set; }
    public List<InvoiceLineItemDto> LineItems { get; set; } = new();
}

public class InvoiceLineItemDto
{
    public Guid Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Total { get; set; }
    public int Order { get; set; }
}

public class CreateInvoiceDto
{
    public Guid ClientId { get; set; }
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }
    public decimal TaxRate { get; set; }
    public string? Notes { get; set; }
    public string? PaymentLink { get; set; }
    public List<CreateInvoiceLineItemDto> LineItems { get; set; } = new();
}

public class CreateInvoiceLineItemDto
{
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public int Order { get; set; }
}

public class UpdateInvoiceDto
{
    public DateTime? InvoiceDate { get; set; }
    public DateTime? DueDate { get; set; }
    public decimal? TaxRate { get; set; }
    public string? Notes { get; set; }
    public string? PaymentLink { get; set; }
    public List<CreateInvoiceLineItemDto>? LineItems { get; set; }
}

public class InvoiceFilterDto
{
    public Guid? ClientId { get; set; }
    public InvoiceStatus? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? SearchTerm { get; set; }
}

public class MarkAsPaidDto
{
    public DateTime PaidAt { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string? TransactionId { get; set; }
}

public class InvoiceStatsDto
{
    public decimal TotalRevenue { get; set; }
    public decimal OutstandingAmount { get; set; }
    public decimal OverdueAmount { get; set; }
    public int TotalInvoices { get; set; }
    public int PaidInvoices { get; set; }
    public int UnpaidInvoices { get; set; }
    public int OverdueInvoices { get; set; }
}
