using AutoMapper;
using FreelanceToolkit.Api.Data;
using FreelanceToolkit.Api.DTOs.Dashboard;
using FreelanceToolkit.Api.Models;
using FreelanceToolkit.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FreelanceToolkit.Api.Services;

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DashboardService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<DashboardStatsDto> GetStatsAsync(string userId)
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfLastMonth = startOfMonth.AddMonths(-1);
        var startOfYear = new DateTime(now.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var oneWeekFromNow = now.AddDays(7);

        // Revenue stats
        var invoicesThisMonth = await _context
            .Invoices.Where(i =>
                i.UserId == userId
                && i.Status == InvoiceStatus.Paid
                && i.PaidAt >= startOfMonth
                && i.PaidAt < startOfMonth.AddMonths(1)
            )
            .ToListAsync();

        var invoicesLastMonth = await _context
            .Invoices.Where(i =>
                i.UserId == userId
                && i.Status == InvoiceStatus.Paid
                && i.PaidAt >= startOfLastMonth
                && i.PaidAt < startOfMonth
            )
            .ToListAsync();

        var invoicesThisYear = await _context
            .Invoices.Where(i =>
                i.UserId == userId && i.Status == InvoiceStatus.Paid && i.PaidAt >= startOfYear
            )
            .ToListAsync();

        var revenueThisMonth = invoicesThisMonth.Sum(i => i.Total);
        var revenueLastMonth = invoicesLastMonth.Sum(i => i.Total);
        var revenueThisYear = invoicesThisYear.Sum(i => i.Total);

        var revenuePercentChange =
            revenueLastMonth > 0
                ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
                : 0;

        // Invoice stats
        var allInvoices = await _context.Invoices.Where(i => i.UserId == userId).ToListAsync();

        var unpaidInvoices = allInvoices.Where(i => i.Status == InvoiceStatus.Sent).ToList();
        var overdueInvoices = allInvoices.Where(i => i.Status == InvoiceStatus.Overdue).ToList();

        // Proposal stats
        var allProposals = await _context.Proposals.Where(p => p.UserId == userId).ToListAsync();

        var totalProposals = allProposals.Count;
        var draftProposals = allProposals.Count(p => p.Status == ProposalStatus.Draft);
        var sentProposals = allProposals.Count(p => p.Status == ProposalStatus.Sent);
        var acceptedProposals = allProposals.Count(p => p.Status == ProposalStatus.Accepted);

        var proposalAcceptanceRate =
            sentProposals + acceptedProposals > 0
                ? (decimal)acceptedProposals / (sentProposals + acceptedProposals) * 100
                : 0;

        // Client stats
        var totalClients = await _context.Clients.Where(c => c.UserId == userId).CountAsync();

        var clientsWithRecentActivity = await _context
            .Clients.Where(c =>
                c.UserId == userId
                && (
                    c.Proposals.Any(p => p.CreatedAt >= now.AddMonths(-3))
                    || c.Invoices.Any(i => i.CreatedAt >= now.AddMonths(-3))
                    || c.CalendarBookings.Any(b => b.CreatedAt >= now.AddMonths(-3))
                )
            )
            .CountAsync();

        // Calendar stats
        var upcomingBookings = await _context
            .CalendarBookings.Where(b =>
                b.UserId == userId && b.Status == BookingStatus.Confirmed && b.StartTime > now
            )
            .CountAsync();

        var bookingsThisWeek = await _context
            .CalendarBookings.Where(b =>
                b.UserId == userId
                && b.Status == BookingStatus.Confirmed
                && b.StartTime >= now
                && b.StartTime <= oneWeekFromNow
            )
            .CountAsync();

        var bookingsThisMonth = await _context
            .CalendarBookings.Where(b =>
                b.UserId == userId
                && b.StartTime >= startOfMonth
                && b.StartTime < startOfMonth.AddMonths(1)
            )
            .CountAsync();

        // Recent activity
        var recentInvoices = await _context
            .Invoices.Include(i => i.Client)
            .Where(i => i.UserId == userId)
            .OrderByDescending(i => i.CreatedAt)
            .Take(5)
            .ToListAsync();

        var recentProposals = await _context
            .Proposals.Include(p => p.Client)
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Take(5)
            .ToListAsync();

        var upcomingBookingsList = await _context
            .CalendarBookings.Include(b => b.Client)
            .Where(b =>
                b.UserId == userId && b.Status == BookingStatus.Confirmed && b.StartTime > now
            )
            .OrderBy(b => b.StartTime)
            .Take(5)
            .ToListAsync();

        return new DashboardStatsDto
        {
            // Revenue
            RevenueThisMonth = revenueThisMonth,
            RevenueLastMonth = revenueLastMonth,
            RevenueThisYear = revenueThisYear,
            RevenuePercentChange = revenuePercentChange,

            // Invoices
            TotalInvoices = allInvoices.Count,
            UnpaidInvoices = unpaidInvoices.Count,
            OverdueInvoices = overdueInvoices.Count,
            UnpaidAmount = unpaidInvoices.Sum(i => i.Total),
            OverdueAmount = overdueInvoices.Sum(i => i.Total),

            // Proposals
            TotalProposals = totalProposals,
            DraftProposals = draftProposals,
            SentProposals = sentProposals,
            AcceptedProposals = acceptedProposals,
            ProposalAcceptanceRate = proposalAcceptanceRate,

            // Clients
            TotalClients = totalClients,
            ActiveClients = clientsWithRecentActivity,

            // Calendar
            UpcomingBookings = upcomingBookings,
            BookingsThisWeek = bookingsThisWeek,
            BookingsThisMonth = bookingsThisMonth,

            // Recent activity
            RecentInvoices = _mapper.Map<List<RecentInvoiceDto>>(recentInvoices),
            RecentProposals = _mapper.Map<List<RecentProposalDto>>(recentProposals),
            UpcomingBookingsList = _mapper.Map<List<UpcomingBookingDto>>(upcomingBookingsList),
        };
    }
}
