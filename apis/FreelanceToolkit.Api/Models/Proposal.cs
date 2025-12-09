namespace FreelanceToolkit.Api.Models;

public enum ProposalStatus
{
    Draft,
    Sent,
    Viewed,
    Accepted,
    Rejected,
    Expired,
}

public class Proposal
{
    public Guid Id { get; set; }
    public string ProposalNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string ProjectScope { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "EUR";
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Disclaimer { get; set; }
    public ProposalStatus Status { get; set; } = ProposalStatus.Draft;
    public string? PublicLink { get; set; }
    public DateTime? SentAt { get; set; }
    public EmailDeliveryStatus? DeliveryStatus { get; set; }
    public DateTime? LastAttemptAt { get; set; }
    public int RetryCount { get; set; }
    public DateTime? ViewedAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public DateTime? RejectedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Foreign keys
    public Guid ClientId { get; set; }
    public Client Client { get; set; } = null!;

    public Guid? TemplateId { get; set; }
    public ProposalTemplate? Template { get; set; }

    // Foreign key - references user ID from Identity.Api
    public string UserId { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<ProposalLineItem> LineItems { get; set; } = new List<ProposalLineItem>();
    public ICollection<ProposalVersion> Versions { get; set; } = new List<ProposalVersion>();
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}

public class ProposalLineItem
{
    public Guid Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal Total => Quantity * UnitPrice;
    public int Order { get; set; }

    // Foreign key
    public Guid ProposalId { get; set; }
    public Proposal Proposal { get; set; } = null!;
}

public class ProposalVersion
{
    public Guid Id { get; set; }
    public int VersionNumber { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? ChangeSummary { get; set; }
    public string? ChangedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Foreign key
    public Guid ProposalId { get; set; }
    public Proposal Proposal { get; set; } = null!;
}
