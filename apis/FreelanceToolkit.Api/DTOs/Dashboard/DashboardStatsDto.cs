namespace FreelanceToolkit.Api.DTOs.Dashboard;

public class DashboardStatsDto
{
    // Revenue stats
    public decimal RevenueThisMonth { get; set; }
    public decimal RevenueLastMonth { get; set; }
    public decimal RevenueThisYear { get; set; }
    public decimal RevenuePercentChange { get; set; }

    // Invoice stats
    public int TotalInvoices { get; set; }
    public int UnpaidInvoices { get; set; }
    public int OverdueInvoices { get; set; }
    public decimal UnpaidAmount { get; set; }
    public decimal OverdueAmount { get; set; }

    // Proposal stats
    public int TotalProposals { get; set; }
    public int DraftProposals { get; set; }
    public int SentProposals { get; set; }
    public int AcceptedProposals { get; set; }
    public decimal ProposalAcceptanceRate { get; set; }

    // Client stats
    public int TotalClients { get; set; }
    public int ActiveClients { get; set; }

    // Calendar stats
    public int UpcomingBookings { get; set; }
    public int BookingsThisWeek { get; set; }
    public int BookingsThisMonth { get; set; }

    // Recent activity
    public List<RecentInvoiceDto> RecentInvoices { get; set; } = new();
    public List<RecentProposalDto> RecentProposals { get; set; } = new();
    public List<UpcomingBookingDto> UpcomingBookingsList { get; set; } = new();
}

public class RecentInvoiceDto
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = default!;
    public string ClientName { get; set; } = default!;
    public decimal Total { get; set; }
    public string Status { get; set; } = default!;
    public DateTime DueDate { get; set; }
}

public class RecentProposalDto
{
    public Guid Id { get; set; }
    public string ProposalNumber { get; set; } = default!;
    public string ClientName { get; set; } = default!;
    public decimal Total { get; set; }
    public string Status { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}

public class UpcomingBookingDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = default!;
    public string? ClientName { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? Location { get; set; }
}
