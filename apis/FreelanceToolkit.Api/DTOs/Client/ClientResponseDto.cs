namespace FreelanceToolkit.Api.DTOs.Client;

public class ClientResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Company { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; }
    public string? TaxId { get; set; }
    public string? Notes { get; set; }
    public List<string>? Tags { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Aggregate counts
    public int ProposalsCount { get; set; }
    public int InvoicesCount { get; set; }
    public int BookingsCount { get; set; }
    public decimal TotalRevenue { get; set; }
}
