using FreelanceToolkit.Api.Models;

namespace FreelanceToolkit.Api.DTOs;

public class ProposalDto
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
    public ProposalStatus Status { get; set; }
    public string? PublicLink { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? ViewedAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public DateTime? RejectedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public List<ProposalLineItemDto> LineItems { get; set; } = new();
}

public class ProposalLineItemDto
{
    public Guid Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Total { get; set; }
    public int Order { get; set; }
}

public class CreateProposalDto
{
    public Guid ClientId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ProjectScope { get; set; } = string.Empty;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Disclaimer { get; set; }
    public Guid? TemplateId { get; set; }
    public List<CreateProposalLineItemDto> LineItems { get; set; } = new();
}

public class CreateProposalLineItemDto
{
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public int Order { get; set; }
}

public class UpdateProposalDto
{
    public string? Title { get; set; }
    public string? ProjectScope { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Disclaimer { get; set; }
    public List<CreateProposalLineItemDto>? LineItems { get; set; }
}

public class ProposalFilterDto
{
    public Guid? ClientId { get; set; }
    public ProposalStatus? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? SearchTerm { get; set; }
}

public class ProposalVersionDto
{
    public Guid Id { get; set; }
    public int VersionNumber { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? ChangeSummary { get; set; }
    public string? ChangedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}
