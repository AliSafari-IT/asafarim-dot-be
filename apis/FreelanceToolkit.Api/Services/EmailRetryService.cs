using FreelanceToolkit.Api.Data;
using FreelanceToolkit.Api.Models;
using FreelanceToolkit.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FreelanceToolkit.Api.Services;

public class EmailRetryConfiguration
{
    public int MaxRetries { get; set; } = 4;
    public int BaseDelayMinutes { get; set; } = 1;
}

public interface IEmailRetryService
{
    Task ProcessRetries();
}

public class EmailRetryService : IEmailRetryService
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IPdfService _pdfService;
    private readonly ILogger<EmailRetryService> _logger;
    private readonly EmailRetryConfiguration _config;

    public EmailRetryService(
        ApplicationDbContext context,
        IEmailService emailService,
        IPdfService pdfService,
        ILogger<EmailRetryService> logger,
        IOptions<EmailRetryConfiguration> config
    )
    {
        _context = context;
        _emailService = emailService;
        _pdfService = pdfService;
        _logger = logger;
        _config = config.Value;
    }

    public async Task ProcessRetries()
    {
        _logger.LogInformation("[EmailRetryService] Starting email retry processing");

        await RetryProposals();
        await RetryInvoices();
        await RetryBookings();

        _logger.LogInformation("[EmailRetryService] Email retry processing completed");
    }

    private async Task RetryProposals()
    {
        var failedProposals = await _context
            .Proposals.Include(p => p.Client)
            .Include(p => p.LineItems)
            .Where(p =>
                p.DeliveryStatus == EmailDeliveryStatus.Failed
                && p.RetryCount < _config.MaxRetries
                && p.LastAttemptAt != null
                && p.LastAttemptAt.Value.AddMinutes(CalculateDelay(p.RetryCount)) < DateTime.UtcNow
            )
            .ToListAsync();

        foreach (var proposal in failedProposals)
        {
            await RetryProposal(proposal);
        }
    }

    private async Task RetryProposal(Proposal proposal)
    {
        try
        {
            proposal.DeliveryStatus = EmailDeliveryStatus.Retrying;
            proposal.LastAttemptAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "[EmailRetryService] Retrying proposal {ProposalNumber} (attempt {RetryCount}/{MaxRetries})",
                proposal.ProposalNumber,
                proposal.RetryCount + 1,
                _config.MaxRetries
            );

            var pdfBytes = await _pdfService.GenerateProposalPdfAsync(proposal.Id, proposal.UserId);

            await _emailService.SendProposalAsync(
                proposal.ProposalNumber,
                proposal.Title,
                proposal.Client.Name,
                proposal.TotalAmount,
                proposal.EndDate,
                pdfBytes,
                proposal.Client.Email
            );

            proposal.DeliveryStatus = EmailDeliveryStatus.Sent;
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "[EmailRetryService] Proposal {ProposalNumber} sent successfully on retry",
                proposal.ProposalNumber
            );
        }
        catch (Exception ex)
        {
            proposal.DeliveryStatus = EmailDeliveryStatus.Failed;
            proposal.RetryCount++;
            await _context.SaveChangesAsync();

            _logger.LogError(
                ex,
                "[EmailRetryService] Failed to retry proposal {ProposalNumber}: {ErrorMessage}",
                proposal.ProposalNumber,
                ex.Message
            );
        }
    }

    private async Task RetryInvoices()
    {
        var failedInvoices = await _context
            .Invoices.Include(i => i.Client)
            .Include(i => i.LineItems)
            .Where(i =>
                i.DeliveryStatus == EmailDeliveryStatus.Failed
                && i.RetryCount < _config.MaxRetries
                && i.LastAttemptAt != null
                && i.LastAttemptAt.Value.AddMinutes(CalculateDelay(i.RetryCount)) < DateTime.UtcNow
            )
            .ToListAsync();

        foreach (var invoice in failedInvoices)
        {
            await RetryInvoice(invoice);
        }
    }

    private async Task RetryInvoice(Invoice invoice)
    {
        try
        {
            invoice.DeliveryStatus = EmailDeliveryStatus.Retrying;
            invoice.LastAttemptAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "[EmailRetryService] Retrying invoice {InvoiceNumber} (attempt {RetryCount}/{MaxRetries})",
                invoice.InvoiceNumber,
                invoice.RetryCount + 1,
                _config.MaxRetries
            );

            var pdfBytes = await _pdfService.GenerateInvoicePdfAsync(invoice.Id, invoice.UserId);

            await _emailService.SendInvoiceAsync(
                invoice.InvoiceNumber,
                invoice.Client.Name,
                invoice.Total,
                invoice.DueDate,
                invoice.Notes,
                pdfBytes,
                invoice.Client.Email
            );

            invoice.DeliveryStatus = EmailDeliveryStatus.Sent;
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "[EmailRetryService] Invoice {InvoiceNumber} sent successfully on retry",
                invoice.InvoiceNumber
            );
        }
        catch (Exception ex)
        {
            invoice.DeliveryStatus = EmailDeliveryStatus.Failed;
            invoice.RetryCount++;
            await _context.SaveChangesAsync();

            _logger.LogError(
                ex,
                "[EmailRetryService] Failed to retry invoice {InvoiceNumber}: {ErrorMessage}",
                invoice.InvoiceNumber,
                ex.Message
            );
        }
    }

    private async Task RetryBookings()
    {
        var failedBookings = await _context
            .CalendarBookings.Include(b => b.Client)
            .Where(b =>
                b.DeliveryStatus == EmailDeliveryStatus.Failed
                && b.RetryCount < _config.MaxRetries
                && b.LastAttemptAt != null
                && b.LastAttemptAt.Value.AddMinutes(CalculateDelay(b.RetryCount)) < DateTime.UtcNow
            )
            .ToListAsync();

        foreach (var booking in failedBookings)
        {
            await RetryBooking(booking);
        }
    }

    private async Task RetryBooking(CalendarBooking booking)
    {
        try
        {
            booking.DeliveryStatus = EmailDeliveryStatus.Retrying;
            booking.LastAttemptAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "[EmailRetryService] Retrying booking {BookingId} (attempt {RetryCount}/{MaxRetries})",
                booking.Id,
                booking.RetryCount + 1,
                _config.MaxRetries
            );

            await _emailService.SendBookingConfirmationAsync(
                booking.Title,
                booking.ClientName,
                booking.StartTime,
                booking.EndTime,
                booking.Location,
                booking.MeetingLink,
                booking.Description,
                booking.ClientEmail
            );

            booking.DeliveryStatus = EmailDeliveryStatus.Sent;
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "[EmailRetryService] Booking {BookingId} sent successfully on retry",
                booking.Id
            );
        }
        catch (Exception ex)
        {
            booking.DeliveryStatus = EmailDeliveryStatus.Failed;
            booking.RetryCount++;
            await _context.SaveChangesAsync();

            _logger.LogError(
                ex,
                "[EmailRetryService] Failed to retry booking {BookingId}: {ErrorMessage}",
                booking.Id,
                ex.Message
            );
        }
    }

    private int CalculateDelay(int retryCount)
    {
        // Exponential backoff: 1m → 2m → 4m → 8m → 16m
        return _config.BaseDelayMinutes * (int)Math.Pow(2, retryCount);
    }
}
