using System.Text;
using System.Text.Json;
using AutoMapper;
using FreelanceToolkit.Api.Data;
using FreelanceToolkit.Api.DTOs.Proposal;
using FreelanceToolkit.Api.Models;
using FreelanceToolkit.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FreelanceToolkit.Api.Services;

public class ProposalService : IProposalService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IEmailService _emailService;
    private readonly IPdfService _pdfService;
    private readonly ILogger<ProposalService> _logger;

    public ProposalService(
        ApplicationDbContext context,
        IMapper mapper,
        IEmailService emailService,
        IPdfService pdfService,
        ILogger<ProposalService> logger
    )
    {
        _context = context;
        _mapper = mapper;
        _emailService = emailService;
        _pdfService = pdfService;
        _logger = logger;
    }

    public async Task<ProposalResponseDto> CreateAsync(CreateProposalDto dto, string userId)
    {
        // Verify client exists and belongs to user
        var clientExists = await _context.Clients.AnyAsync(c =>
            c.Id == dto.ClientId && c.UserId == userId
        );

        if (!clientExists)
            throw new KeyNotFoundException($"Client with ID {dto.ClientId} not found");

        var proposal = _mapper.Map<Proposal>(dto);
        proposal.Id = Guid.NewGuid();
        proposal.UserId = userId;
        proposal.ProposalNumber = await GenerateProposalNumberAsync(userId);
        proposal.CreatedAt = DateTime.UtcNow;
        proposal.Status = ProposalStatus.Draft;

        // Calculate totals
        CalculateTotals(proposal);

        _context.Proposals.Add(proposal);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(proposal.Id, userId);
    }

    public async Task<ProposalResponseDto> GetByIdAsync(Guid id, string userId)
    {
        var proposal = await _context
            .Proposals.Include(p => p.Client)
            .Include(p => p.LineItems)
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (proposal == null)
            throw new KeyNotFoundException($"Proposal with ID {id} not found");

        return _mapper.Map<ProposalResponseDto>(proposal);
    }

    public async Task<List<ProposalResponseDto>> GetAllAsync(
        string userId,
        string? status = null,
        Guid? clientId = null
    )
    {
        var query = _context
            .Proposals.Include(p => p.Client)
            .Include(p => p.LineItems)
            .Where(p => p.UserId == userId);

        if (
            !string.IsNullOrWhiteSpace(status)
            && Enum.TryParse<ProposalStatus>(status, true, out var statusEnum)
        )
        {
            query = query.Where(p => p.Status == statusEnum);
        }

        if (clientId.HasValue)
        {
            query = query.Where(p => p.ClientId == clientId.Value);
        }

        var proposals = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();

        return _mapper.Map<List<ProposalResponseDto>>(proposals);
    }

    public async Task<ProposalResponseDto> UpdateAsync(
        Guid id,
        UpdateProposalDto dto,
        string userId
    )
    {
        var proposal = await _context
            .Proposals.Include(p => p.LineItems)
            .Include(p => p.Client)
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (proposal == null)
            throw new KeyNotFoundException($"Proposal with ID {id} not found");

        // Remove old line items
        _context.ProposalLineItems.RemoveRange(proposal.LineItems);

        // Map updates
        _mapper.Map(dto, proposal);
        proposal.UpdatedAt = DateTime.UtcNow;

        // Calculate totals
        CalculateTotals(proposal);

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id, userId);
    }

    public async Task DeleteAsync(Guid id, string userId)
    {
        var proposal = await _context.Proposals.FirstOrDefaultAsync(p =>
            p.Id == id && p.UserId == userId
        );

        if (proposal == null)
            throw new KeyNotFoundException($"Proposal with ID {id} not found");

        _context.Proposals.Remove(proposal);
        await _context.SaveChangesAsync();
    }

    public async Task<ProposalResponseDto> SendAsync(
        Guid id,
        string userId,
        string? customSubject = null,
        string? customBody = null
    )
    {
        var proposal = await _context
            .Proposals.Include(p => p.Client)
            .Include(p => p.LineItems)
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (proposal == null)
            throw new KeyNotFoundException($"Proposal with ID {id} not found");

        if (proposal.Status != ProposalStatus.Draft)
            throw new InvalidOperationException("Only draft proposals can be sent");

        // Verify client has email
        if (string.IsNullOrWhiteSpace(proposal.Client?.Email))
            throw new InvalidOperationException("Client does not have an email address");

        proposal.Status = ProposalStatus.Sent;
        proposal.SentAt = DateTime.UtcNow;
        proposal.UpdatedAt = DateTime.UtcNow;
        proposal.DeliveryStatus = EmailDeliveryStatus.Pending;
        proposal.LastAttemptAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Send email to client
        try
        {
            _logger.LogInformation(
                "[ProposalService] Starting email send for proposal {ProposalId} to {ClientEmail}",
                id,
                proposal.Client.Email
            );
            var pdfBytes = await _pdfService.GenerateProposalPdfAsync(id, userId);
            _logger.LogInformation(
                "[ProposalService] PDF generated successfully, size: {PdfSize} bytes",
                pdfBytes.Length
            );

            // Use custom email content if provided, otherwise use default template
            if (!string.IsNullOrWhiteSpace(customSubject) && !string.IsNullOrWhiteSpace(customBody))
            {
                await _emailService.SendCustomEmailAsync(
                    customSubject,
                    customBody,
                    proposal.Client.Email,
                    proposal.Client.Name,
                    pdfBytes,
                    $"Proposal-{proposal.ProposalNumber}.pdf"
                );
            }
            else
            {
                await _emailService.SendProposalAsync(
                    proposal.ProposalNumber,
                    proposal.Title,
                    proposal.Client.Name,
                    proposal.TotalAmount,
                    proposal.EndDate,
                    pdfBytes,
                    proposal.Client.Email
                );
            }

            proposal.DeliveryStatus = EmailDeliveryStatus.Sent;
            proposal.LastAttemptAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "[ProposalService] Email sent successfully for proposal {ProposalId}",
                id
            );
        }
        catch (Exception ex)
        {
            proposal.DeliveryStatus = EmailDeliveryStatus.Failed;
            proposal.LastAttemptAt = DateTime.UtcNow;
            proposal.RetryCount++;
            await _context.SaveChangesAsync();

            _logger.LogError(
                ex,
                "[ProposalService] Failed to send proposal email for proposal {ProposalId}: {ErrorMessage}",
                id,
                ex.Message
            );
        }

        return _mapper.Map<ProposalResponseDto>(proposal);
    }

    public async Task<ProposalResponseDto> AcceptAsync(Guid id, string userId)
    {
        var proposal = await _context
            .Proposals.Include(p => p.Client)
            .Include(p => p.LineItems)
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (proposal == null)
            throw new KeyNotFoundException($"Proposal with ID {id} not found");

        if (proposal.Status != ProposalStatus.Sent)
            throw new InvalidOperationException("Only sent proposals can be accepted");

        proposal.Status = ProposalStatus.Accepted;
        proposal.AcceptedAt = DateTime.UtcNow;
        proposal.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<ProposalResponseDto>(proposal);
    }

    public async Task<ProposalResponseDto> RejectAsync(Guid id, string userId)
    {
        var proposal = await _context
            .Proposals.Include(p => p.Client)
            .Include(p => p.LineItems)
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (proposal == null)
            throw new KeyNotFoundException($"Proposal with ID {id} not found");

        if (proposal.Status != ProposalStatus.Sent)
            throw new InvalidOperationException("Only sent proposals can be rejected");

        proposal.Status = ProposalStatus.Rejected;
        proposal.RejectedAt = DateTime.UtcNow;
        proposal.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<ProposalResponseDto>(proposal);
    }

    public async Task<ProposalResponseDto> CreateVersionAsync(Guid id, string userId)
    {
        var proposal = await _context
            .Proposals.Include(p => p.LineItems)
            .Include(p => p.Versions)
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (proposal == null)
            throw new KeyNotFoundException($"Proposal with ID {id} not found");

        var currentVersionNumber =
            proposal.Versions.Count > 0 ? proposal.Versions.Max(v => v.VersionNumber) : 0;

        // Serialize current state
        var content = JsonSerializer.Serialize(
            proposal,
            new JsonSerializerOptions
            {
                ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles,
            }
        );

        // Create version snapshot
        var version = new ProposalVersion
        {
            Id = Guid.NewGuid(),
            ProposalId = proposal.Id,
            VersionNumber = currentVersionNumber + 1,
            Content = content,
            CreatedAt = DateTime.UtcNow,
            ChangeSummary = $"Version {currentVersionNumber + 1} created automatically",
        };

        _context.ProposalVersions.Add(version);
        proposal.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id, userId);
    }

    public async Task<List<ProposalVersionDto>> GetVersionsAsync(Guid id, string userId)
    {
        var proposal = await _context.Proposals.FirstOrDefaultAsync(p =>
            p.Id == id && p.UserId == userId
        );

        if (proposal == null)
            throw new KeyNotFoundException($"Proposal with ID {id} not found");

        var versions = await _context
            .ProposalVersions.Where(v => v.ProposalId == id)
            .OrderByDescending(v => v.VersionNumber)
            .ToListAsync();

        return _mapper.Map<List<ProposalVersionDto>>(versions);
    }

    public async Task<string> GenerateHtmlAsync(Guid id, string userId)
    {
        var proposal = await _context
            .Proposals.Include(p => p.Client)
            .Include(p => p.LineItems)
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (proposal == null)
            throw new KeyNotFoundException($"Proposal with ID {id} not found");

        var html = new StringBuilder();
        html.AppendLine("<!DOCTYPE html>");
        html.AppendLine("<html>");
        html.AppendLine("<head>");
        html.AppendLine("<meta charset='utf-8'>");
        html.AppendLine("<title>Proposal - " + proposal.ProposalNumber + "</title>");
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
        html.AppendLine("</style>");
        html.AppendLine("</head>");
        html.AppendLine("<body>");

        // Header
        html.AppendLine($"<h1>Proposal {proposal.ProposalNumber}</h1>");
        html.AppendLine($"<p><strong>Client:</strong> {proposal.Client.Name}</p>");
        html.AppendLine($"<p><strong>Title:</strong> {proposal.Title}</p>");
        if (!string.IsNullOrWhiteSpace(proposal.ProjectScope))
            html.AppendLine($"<p><strong>Scope:</strong> {proposal.ProjectScope}</p>");
        html.AppendLine($"<p><strong>Created:</strong> {proposal.CreatedAt:MMMM dd, yyyy}</p>");

        // Line items
        html.AppendLine("<h2>Items</h2>");
        html.AppendLine("<table>");
        html.AppendLine(
            "<thead><tr><th>Description</th><th>Quantity</th><th>Unit Price</th><th class='text-right'>Total</th></tr></thead>"
        );
        html.AppendLine("<tbody>");

        foreach (var item in proposal.LineItems)
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
            $"<tr class='total'><td>Total:</td><td class='text-right'>${proposal.TotalAmount:N2}</td></tr>"
        );
        html.AppendLine("</table>");

        // Disclaimer (Terms)
        if (!string.IsNullOrWhiteSpace(proposal.Disclaimer))
        {
            html.AppendLine("<h2>Terms & Conditions</h2>");
            html.AppendLine($"<p>{proposal.Disclaimer}</p>");
        }

        html.AppendLine("</body>");
        html.AppendLine("</html>");

        return html.ToString();
    }

    // Template methods
    public async Task<ProposalTemplateDto> CreateTemplateAsync(
        ProposalTemplateDto dto,
        string userId
    )
    {
        var template = _mapper.Map<ProposalTemplate>(dto);
        template.Id = Guid.NewGuid();
        template.UserId = userId;
        template.CreatedAt = DateTime.UtcNow;

        _context.ProposalTemplates.Add(template);
        await _context.SaveChangesAsync();

        return _mapper.Map<ProposalTemplateDto>(template);
    }

    public async Task<List<ProposalTemplateDto>> GetTemplatesAsync(string userId)
    {
        var templates = await _context
            .ProposalTemplates.Where(t => t.UserId == userId)
            .OrderBy(t => t.Name)
            .ToListAsync();

        return _mapper.Map<List<ProposalTemplateDto>>(templates);
    }

    public async Task<ProposalTemplateDto> GetTemplateByIdAsync(Guid id, string userId)
    {
        var template = await _context.ProposalTemplates.FirstOrDefaultAsync(t =>
            t.Id == id && t.UserId == userId
        );

        if (template == null)
            throw new KeyNotFoundException($"Template with ID {id} not found");

        return _mapper.Map<ProposalTemplateDto>(template);
    }

    public async Task DeleteTemplateAsync(Guid id, string userId)
    {
        var template = await _context.ProposalTemplates.FirstOrDefaultAsync(t =>
            t.Id == id && t.UserId == userId
        );

        if (template == null)
            throw new KeyNotFoundException($"Template with ID {id} not found");

        _context.ProposalTemplates.Remove(template);
        await _context.SaveChangesAsync();
    }

    // Private helpers
    private async Task<string> GenerateProposalNumberAsync(string userId)
    {
        var year = DateTime.UtcNow.Year;
        var count = await _context
            .Proposals.Where(p => p.UserId == userId && p.CreatedAt.Year == year)
            .CountAsync();

        return $"PROP-{year}-{(count + 1):D4}";
    }

    private void CalculateTotals(Proposal proposal)
    {
        proposal.TotalAmount = proposal.LineItems.Sum(li => li.Quantity * li.UnitPrice);
    }
}
