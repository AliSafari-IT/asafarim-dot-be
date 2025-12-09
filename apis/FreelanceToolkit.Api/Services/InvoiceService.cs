using System.Text;
using AutoMapper;
using FreelanceToolkit.Api.Data;
using FreelanceToolkit.Api.DTOs.Invoice;
using FreelanceToolkit.Api.Models;
using FreelanceToolkit.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FreelanceToolkit.Api.Services;

public class InvoiceService : IInvoiceService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IEmailService _emailService;
    private readonly IPdfService _pdfService;
    private readonly ILogger<InvoiceService> _logger;

    public InvoiceService(
        ApplicationDbContext context,
        IMapper mapper,
        IEmailService emailService,
        IPdfService pdfService,
        ILogger<InvoiceService> logger
    )
    {
        _context = context;
        _mapper = mapper;
        _emailService = emailService;
        _pdfService = pdfService;
        _logger = logger;
    }

    public async Task<InvoiceResponseDto> CreateAsync(CreateInvoiceDto dto, string userId)
    {
        var clientExists = await _context.Clients.AnyAsync(c =>
            c.Id == dto.ClientId && c.UserId == userId
        );

        if (!clientExists)
            throw new KeyNotFoundException($"Client with ID {dto.ClientId} not found");

        var invoice = _mapper.Map<Invoice>(dto);
        invoice.Id = Guid.NewGuid();
        invoice.UserId = userId;
        invoice.InvoiceNumber = await GenerateInvoiceNumberAsync(userId);
        invoice.CreatedAt = DateTime.UtcNow;
        invoice.Status = InvoiceStatus.Draft;
        invoice.InvoiceDate = dto.IssueDate;

        // Calculate totals
        CalculateTotals(invoice);

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(invoice.Id, userId);
    }

    public async Task<InvoiceResponseDto> GetByIdAsync(Guid id, string userId)
    {
        var invoice = await _context
            .Invoices.Include(i => i.Client)
            .Include(i => i.LineItems)
            .Include(i => i.Proposal)
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (invoice == null)
            throw new KeyNotFoundException($"Invoice with ID {id} not found");

        return _mapper.Map<InvoiceResponseDto>(invoice);
    }

    public async Task<List<InvoiceResponseDto>> GetAllAsync(
        string userId,
        string? status = null,
        Guid? clientId = null
    )
    {
        var query = _context
            .Invoices.Include(i => i.Client)
            .Include(i => i.LineItems)
            .Where(i => i.UserId == userId);

        if (
            !string.IsNullOrWhiteSpace(status)
            && Enum.TryParse<InvoiceStatus>(status, true, out var statusEnum)
        )
        {
            query = query.Where(i => i.Status == statusEnum);
        }

        if (clientId.HasValue)
        {
            query = query.Where(i => i.ClientId == clientId.Value);
        }

        var invoices = await query.OrderByDescending(i => i.CreatedAt).ToListAsync();

        return _mapper.Map<List<InvoiceResponseDto>>(invoices);
    }

    public async Task<InvoiceResponseDto> UpdateAsync(Guid id, UpdateInvoiceDto dto, string userId)
    {
        var invoice = await _context
            .Invoices.Include(i => i.LineItems)
            .Include(i => i.Client)
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (invoice == null)
            throw new KeyNotFoundException($"Invoice with ID {id} not found");

        if (invoice.Status == InvoiceStatus.Paid)
            throw new InvalidOperationException("Cannot update a paid invoice");

        // Remove old line items
        _context.InvoiceLineItems.RemoveRange(invoice.LineItems);

        // Map updates
        _mapper.Map(dto, invoice);
        invoice.UpdatedAt = DateTime.UtcNow;
        invoice.InvoiceDate = dto.IssueDate;

        // Calculate totals
        CalculateTotals(invoice);

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id, userId);
    }

    public async Task DeleteAsync(Guid id, string userId)
    {
        var invoice = await _context.Invoices.FirstOrDefaultAsync(i =>
            i.Id == id && i.UserId == userId
        );

        if (invoice == null)
            throw new KeyNotFoundException($"Invoice with ID {id} not found");

        if (invoice.Status != InvoiceStatus.Draft)
            throw new InvalidOperationException("Only draft invoices can be deleted");

        _context.Invoices.Remove(invoice);
        await _context.SaveChangesAsync();
    }

    public async Task<InvoiceResponseDto> MarkAsPaidAsync(Guid id, string userId)
    {
        var invoice = await _context
            .Invoices.Include(i => i.Client)
            .Include(i => i.LineItems)
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (invoice == null)
            throw new KeyNotFoundException($"Invoice with ID {id} not found");

        invoice.Status = InvoiceStatus.Paid;
        invoice.PaidAt = DateTime.UtcNow;
        invoice.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<InvoiceResponseDto>(invoice);
    }

    public async Task<InvoiceResponseDto> MarkAsCancelledAsync(Guid id, string userId)
    {
        var invoice = await _context
            .Invoices.Include(i => i.Client)
            .Include(i => i.LineItems)
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (invoice == null)
            throw new KeyNotFoundException($"Invoice with ID {id} not found");

        if (invoice.Status == InvoiceStatus.Paid)
            throw new InvalidOperationException("Cannot cancel a paid invoice");

        invoice.Status = InvoiceStatus.Cancelled;
        invoice.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<InvoiceResponseDto>(invoice);
    }

    public async Task<InvoiceResponseDto> SendAsync(Guid id, string userId)
    {
        var invoice = await _context
            .Invoices.Include(i => i.Client)
            .Include(i => i.LineItems)
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (invoice == null)
            throw new KeyNotFoundException($"Invoice with ID {id} not found");

        if (invoice.Status != InvoiceStatus.Draft)
            throw new InvalidOperationException("Only draft invoices can be sent");

        invoice.Status = InvoiceStatus.Sent;
        invoice.SentAt = DateTime.UtcNow;
        invoice.UpdatedAt = DateTime.UtcNow;
        invoice.DeliveryStatus = EmailDeliveryStatus.Pending;
        invoice.LastAttemptAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "[InvoiceService] Sending invoice {InvoiceNumber} to client {ClientEmail}",
            invoice.InvoiceNumber,
            invoice.Client.Email
        );

        try
        {
            var pdfBytes = await _pdfService.GenerateInvoicePdfAsync(id, userId);

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
            invoice.LastAttemptAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "[InvoiceService] Invoice {InvoiceNumber} sent successfully",
                invoice.InvoiceNumber
            );
        }
        catch (Exception ex)
        {
            invoice.DeliveryStatus = EmailDeliveryStatus.Failed;
            invoice.LastAttemptAt = DateTime.UtcNow;
            invoice.RetryCount++;
            await _context.SaveChangesAsync();

            _logger.LogError(
                ex,
                "[InvoiceService] Failed to send invoice {InvoiceNumber}: {ErrorMessage}",
                invoice.InvoiceNumber,
                ex.Message
            );
        }

        return _mapper.Map<InvoiceResponseDto>(invoice);
    }

    public async Task UpdateOverdueStatusesAsync(string userId)
    {
        var overdueInvoices = await _context
            .Invoices.Where(i =>
                i.UserId == userId
                && (i.Status == InvoiceStatus.Sent || i.Status == InvoiceStatus.Draft)
                && i.DueDate < DateTime.UtcNow.Date
            )
            .ToListAsync();

        foreach (var invoice in overdueInvoices)
        {
            invoice.Status = InvoiceStatus.Overdue;
            invoice.UpdatedAt = DateTime.UtcNow;
        }

        if (overdueInvoices.Any())
        {
            await _context.SaveChangesAsync();
        }
    }

    public async Task<string> GenerateHtmlAsync(Guid id, string userId)
    {
        var invoice = await _context
            .Invoices.Include(i => i.Client)
            .Include(i => i.LineItems)
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (invoice == null)
            throw new KeyNotFoundException($"Invoice with ID {id} not found");

        var html = new StringBuilder();
        html.AppendLine("<!DOCTYPE html>");
        html.AppendLine("<html>");
        html.AppendLine("<head>");
        html.AppendLine("<meta charset='utf-8'>");
        html.AppendLine("<title>Invoice - " + invoice.InvoiceNumber + "</title>");
        html.AppendLine("<style>");
        html.AppendLine("body { font-family: Arial, sans-serif; margin: 40px; }");
        html.AppendLine("h1 { color: #333; }");
        html.AppendLine("table { width: 100%; border-collapse: collapse; margin: 20px 0; }");
        html.AppendLine(
            "th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }"
        );
        html.AppendLine("th { background-color: #f2f2f2; }");
        html.AppendLine(".text-right { text-align: right; }");
        html.AppendLine(".total { font-weight: bold; font-size: 1.2em; }");
        html.AppendLine(
            ".paid { color: green; border: 2px solid green; padding: 5px 10px; border-radius: 5px; display: inline-block; }"
        );
        html.AppendLine("</style>");
        html.AppendLine("</head>");
        html.AppendLine("<body>");

        // Header
        html.AppendLine($"<h1>Invoice {invoice.InvoiceNumber}</h1>");
        if (invoice.Status == InvoiceStatus.Paid && invoice.PaidAt.HasValue)
        {
            html.AppendLine(
                $"<div class='paid'>PAID on {invoice.PaidAt.Value:MMMM dd, yyyy}</div>"
            );
        }
        html.AppendLine($"<p><strong>Client:</strong> {invoice.Client.Name}</p>");
        html.AppendLine($"<p><strong>Issue Date:</strong> {invoice.InvoiceDate:MMMM dd, yyyy}</p>");
        html.AppendLine($"<p><strong>Due Date:</strong> {invoice.DueDate:MMMM dd, yyyy}</p>");

        // Line items
        html.AppendLine("<h2>Items</h2>");
        html.AppendLine("<table>");
        html.AppendLine(
            "<thead><tr><th>Description</th><th>Quantity</th><th>Unit Price</th><th class='text-right'>Total</th></tr></thead>"
        );
        html.AppendLine("<tbody>");

        foreach (var item in invoice.LineItems)
        {
            var itemTotal = item.Quantity * item.UnitPrice;
            html.AppendLine("<tr>");
            html.AppendLine($"<td>{item.Description}</td>");
            html.AppendLine($"<td>{item.Quantity}</td>");
            html.AppendLine($"<td>${item.UnitPrice:N2}</td>");
            html.AppendLine($"<td class='text-right'>${itemTotal:N2}</td>");
            html.AppendLine("</tr>");
        }

        html.AppendLine("</tbody>");
        html.AppendLine("</table>");

        // Totals
        html.AppendLine("<table style='width: 300px; margin-left: auto;'>");
        html.AppendLine(
            $"<tr><td>Subtotal:</td><td class='text-right'>${invoice.SubTotal:N2}</td></tr>"
        );
        if (invoice.TaxRate > 0)
        {
            html.AppendLine(
                $"<tr><td>Tax ({invoice.TaxRate}%):</td><td class='text-right'>${invoice.TaxAmount:N2}</td></tr>"
            );
        }
        html.AppendLine(
            $"<tr class='total'><td>Total Due:</td><td class='text-right'>${invoice.Total:N2}</td></tr>"
        );
        html.AppendLine("</table>");

        // Payment Instructions
        if (!string.IsNullOrWhiteSpace(invoice.Notes)) // Assuming Notes might be used for instructions
        {
            html.AppendLine("<h2>Notes</h2>");
            html.AppendLine($"<p>{invoice.Notes}</p>");
        }

        html.AppendLine("</body>");
        html.AppendLine("</html>");

        return html.ToString();
    }

    // Private helpers
    private async Task<string> GenerateInvoiceNumberAsync(string userId)
    {
        var year = DateTime.UtcNow.Year;
        var count = await _context
            .Invoices.Where(i => i.UserId == userId && i.CreatedAt.Year == year)
            .CountAsync();

        return $"INV-{year}-{(count + 1):D4}";
    }

    private void CalculateTotals(Invoice invoice)
    {
        invoice.SubTotal = invoice.LineItems.Sum(li => li.Quantity * li.UnitPrice);

        if (invoice.TaxRate > 0)
        {
            invoice.TaxAmount = invoice.SubTotal * (invoice.TaxRate / 100);
        }
        else
        {
            invoice.TaxAmount = 0;
        }

        invoice.Total = invoice.SubTotal + invoice.TaxAmount;
    }
}
