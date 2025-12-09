namespace FreelanceToolkit.Api.Models;

public class Client
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
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Foreign key - references user ID from Identity.Api
    public string UserId { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<Proposal> Proposals { get; set; } = new List<Proposal>();
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    public ICollection<CalendarBooking> CalendarBookings { get; set; } =
        new List<CalendarBooking>();
}
