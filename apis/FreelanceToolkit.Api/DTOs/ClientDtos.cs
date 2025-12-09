namespace FreelanceToolkit.Api.DTOs;

public class ClientDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? CompanyName { get; set; }
    public string? CompanyWebsite { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? Notes { get; set; }
    public List<string> Tags { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateClientDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? CompanyName { get; set; }
    public string? CompanyWebsite { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? Notes { get; set; }
    public List<string> Tags { get; set; } = new();
}

public class UpdateClientDto
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? CompanyName { get; set; }
    public string? CompanyWebsite { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? Notes { get; set; }
    public List<string>? Tags { get; set; }
}

public class ClientFilterDto
{
    public string? SearchTerm { get; set; }
    public string? Tag { get; set; }
    public string? Country { get; set; }
}

public class ClientDetailsDto
{
    public ClientDto Client { get; set; } = null!;
    public int TotalProposals { get; set; }
    public int AcceptedProposals { get; set; }
    public int TotalInvoices { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal OutstandingAmount { get; set; }
    public int TotalMeetings { get; set; }
    public DateTime? LastContactDate { get; set; }
    public List<ProposalDto> RecentProposals { get; set; } = new();
    public List<InvoiceDto> RecentInvoices { get; set; } = new();
}
