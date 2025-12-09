using Microsoft.AspNetCore.Identity;

namespace FreelanceToolkit.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? CompanyName { get; set; }
    public string? LogoUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }

    // Navigation properties
    public ICollection<Client> Clients { get; set; } = new List<Client>();
    public ICollection<Proposal> Proposals { get; set; } = new List<Proposal>();
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    public ICollection<CalendarBooking> CalendarBookings { get; set; } =
        new List<CalendarBooking>();
}
