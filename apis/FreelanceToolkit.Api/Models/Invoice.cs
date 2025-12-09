namespace FreelanceToolkit.Api.Models;

public enum InvoiceStatus
{
    Draft,
    Sent,
    Paid,
    Overdue,
    Cancelled,
}

public enum PaymentMethod
{
    BankTransfer,
    CreditCard,
    PayPal,
    Stripe,
    Cash,
    Other,
}

public class Invoice
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    public decimal SubTotal { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }
    public string Currency { get; set; } = "EUR";
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    public string? Notes { get; set; }
    public string? PaymentLink { get; set; }
    public DateTime? SentAt { get; set; }
    public EmailDeliveryStatus? DeliveryStatus { get; set; }
    public DateTime? LastAttemptAt { get; set; }
    public int RetryCount { get; set; }
    public DateTime? PaidAt { get; set; }
    public PaymentMethod? PaymentMethod { get; set; }
    public string? TransactionId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Foreign keys
    public Guid ClientId { get; set; }
    public Client Client { get; set; } = null!;

    public Guid? ProposalId { get; set; }
    public Proposal? Proposal { get; set; }

    // Foreign key - references user ID from Identity.Api
    public string UserId { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<InvoiceLineItem> LineItems { get; set; } = new List<InvoiceLineItem>();
}

public class InvoiceLineItem
{
    public Guid Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal Total => Quantity * UnitPrice;
    public int Order { get; set; }

    // Foreign key
    public Guid InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = null!;
}
