using FreelanceToolkit.Api.Data;
using FreelanceToolkit.Api.DTOs.Invoice;
using FreelanceToolkit.Api.DTOs.Proposal;
using FreelanceToolkit.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace FreelanceToolkit.Api.Services;

public class PdfService : IPdfService
{
    private readonly ApplicationDbContext _context;

    public PdfService(ApplicationDbContext context)
    {
        _context = context;

        // Configure QuestPDF license
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<byte[]> GenerateProposalPdfAsync(Guid proposalId, string userId)
    {
        // Fetch proposal directly from database to avoid circular dependency
        var proposal = await _context
            .Proposals.Include(p => p.Client)
            .Include(p => p.LineItems)
            .FirstOrDefaultAsync(p => p.Id == proposalId && p.UserId == userId);

        if (proposal == null)
            throw new KeyNotFoundException($"Proposal with ID {proposalId} not found");

        // Map to DTO for consistency
        var proposalDto = new ProposalResponseDto
        {
            Id = proposal.Id,
            ProposalNumber = proposal.ProposalNumber,
            Title = proposal.Title,
            ProjectScope = proposal.ProjectScope,
            ClientName = proposal.Client.Name,
            TotalAmount = proposal.TotalAmount,
            CreatedAt = proposal.CreatedAt,
            ValidUntil = proposal.EndDate,
            LineItems = proposal
                .LineItems.Select(li => new ProposalLineItemDto
                {
                    Description = li.Description,
                    Quantity = li.Quantity,
                    UnitPrice = li.UnitPrice,
                })
                .ToList(),
        };

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(50);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Arial"));

                page.Header().Element(ComposeProposalHeader);
                page.Content().Element(container => ComposeProposalContent(container, proposalDto));
                page.Footer()
                    .AlignCenter()
                    .Text(text =>
                    {
                        text.Span("Page ");
                        text.CurrentPageNumber();
                        text.Span(" of ");
                        text.TotalPages();
                    });

                void ComposeProposalHeader(IContainer container)
                {
                    container.Row(row =>
                    {
                        row.RelativeItem()
                            .Column(column =>
                            {
                                column
                                    .Item()
                                    .Text($"Proposal {proposalDto.ProposalNumber}")
                                    .FontSize(20)
                                    .Bold()
                                    .FontColor(Colors.Blue.Medium);
                                column
                                    .Item()
                                    .Text($"Status: {proposalDto.Status}")
                                    .FontSize(12)
                                    .FontColor(Colors.Grey.Darken2);
                            });

                        row.RelativeItem()
                            .Column(column =>
                            {
                                column
                                    .Item()
                                    .AlignRight()
                                    .Text(proposalDto.ClientName)
                                    .FontSize(14)
                                    .Bold();
                                column
                                    .Item()
                                    .AlignRight()
                                    .Text($"Created: {proposalDto.CreatedAt:MMMM dd, yyyy}")
                                    .FontSize(10);
                                if (proposalDto.ValidUntil.HasValue)
                                    column
                                        .Item()
                                        .AlignRight()
                                        .Text(
                                            $"Valid Until: {proposalDto.ValidUntil.Value:MMMM dd, yyyy}"
                                        )
                                        .FontSize(10);
                            });
                    });
                }
            });
        });

        return document.GeneratePdf();
    }

    public async Task<byte[]> GenerateInvoicePdfAsync(Guid invoiceId, string userId)
    {
        // Fetch invoice directly from database to avoid circular dependency
        var invoice = await _context
            .Invoices.Include(i => i.Client)
            .Include(i => i.LineItems)
            .FirstOrDefaultAsync(i => i.Id == invoiceId && i.UserId == userId);

        if (invoice == null)
            throw new KeyNotFoundException($"Invoice with ID {invoiceId} not found");

        // Map to DTO for consistency
        var invoiceDto = new InvoiceResponseDto
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            ClientId = invoice.ClientId,
            ClientName = invoice.Client.Name,
            IssueDate = invoice.InvoiceDate,
            DueDate = invoice.DueDate,
            Status = invoice.Status.ToString(),
            Subtotal = invoice.SubTotal,
            TaxPercent = invoice.TaxRate,
            TaxAmount = invoice.TaxAmount,
            Total = invoice.Total,
            Notes = invoice.Notes,
            CreatedAt = invoice.CreatedAt,
            PaidAt = invoice.PaidAt,
            LineItems = invoice
                .LineItems.Select(li => new InvoiceLineItemDto
                {
                    Description = li.Description,
                    Quantity = li.Quantity,
                    UnitPrice = li.UnitPrice,
                })
                .ToList(),
        };

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(50);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Arial"));

                page.Header().Element(ComposeInvoiceHeader);
                page.Content().Element(container => ComposeInvoiceContent(container, invoiceDto));
                page.Footer()
                    .AlignCenter()
                    .Text(text =>
                    {
                        text.Span("Page ");
                        text.CurrentPageNumber();
                        text.Span(" of ");
                        text.TotalPages();
                    });

                void ComposeInvoiceHeader(IContainer container)
                {
                    container.Row(row =>
                    {
                        row.RelativeItem()
                            .Column(column =>
                            {
                                column
                                    .Item()
                                    .Text($"Invoice {invoiceDto.InvoiceNumber}")
                                    .FontSize(20)
                                    .Bold()
                                    .FontColor(Colors.Blue.Medium);
                                column
                                    .Item()
                                    .Text($"Status: {invoiceDto.Status}")
                                    .FontSize(12)
                                    .FontColor(GetStatusColor(invoiceDto.Status));
                            });

                        row.RelativeItem()
                            .Column(column =>
                            {
                                column
                                    .Item()
                                    .AlignRight()
                                    .Text(invoiceDto.ClientName)
                                    .FontSize(14)
                                    .Bold();
                                column
                                    .Item()
                                    .AlignRight()
                                    .Text($"Issue Date: {invoiceDto.IssueDate:MMMM dd, yyyy}")
                                    .FontSize(10);
                                column
                                    .Item()
                                    .AlignRight()
                                    .Text($"Due Date: {invoiceDto.DueDate:MMMM dd, yyyy}")
                                    .FontSize(10)
                                    .Bold();
                            });
                    });
                }
            });
        });

        return document.GeneratePdf();
    }

    private void ComposeProposalContent(IContainer container, ProposalResponseDto proposal)
    {
        container.Column(column =>
        {
            column.Spacing(20);

            // Title and description
            if (!string.IsNullOrWhiteSpace(proposal.Title))
            {
                column.Item().Text(proposal.Title).FontSize(16).Bold();
            }

            if (!string.IsNullOrWhiteSpace(proposal.ProjectScope))
            {
                column.Item().Text(proposal.ProjectScope).FontSize(11);
            }

            // Line items table
            column.Item().Text("Items").FontSize(14).Bold();
            column
                .Item()
                .Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(1);
                        columns.RelativeColumn(1);
                        columns.RelativeColumn(1);
                    });

                    table.Header(header =>
                    {
                        header.Cell().Element(CellStyle).Text("Description").Bold();
                        header.Cell().Element(CellStyle).AlignRight().Text("Qty").Bold();
                        header.Cell().Element(CellStyle).AlignRight().Text("Price").Bold();
                        header.Cell().Element(CellStyle).AlignRight().Text("Total").Bold();

                        static IContainer CellStyle(IContainer container)
                        {
                            return container
                                .BorderBottom(1)
                                .BorderColor(Colors.Grey.Lighten2)
                                .PaddingVertical(5);
                        }
                    });

                    foreach (var item in proposal.LineItems)
                    {
                        table.Cell().Element(CellStyle).Text(item.Description);
                        table.Cell().Element(CellStyle).AlignRight().Text(item.Quantity.ToString());
                        table.Cell().Element(CellStyle).AlignRight().Text($"${item.UnitPrice:N2}");
                        table.Cell().Element(CellStyle).AlignRight().Text($"${item.Total:N2}");

                        static IContainer CellStyle(IContainer container)
                        {
                            return container
                                .BorderBottom(1)
                                .BorderColor(Colors.Grey.Lighten3)
                                .PaddingVertical(5);
                        }
                    }
                });

            // Totals
            column
                .Item()
                .AlignRight()
                .Column(totalsColumn =>
                {
                    totalsColumn
                        .Item()
                        .Row(row =>
                        {
                            row.AutoItem().Width(150).Text("Total:").Bold().FontSize(14);
                            row.AutoItem()
                                .Width(100)
                                .AlignRight()
                                .Text($"${proposal.TotalAmount:N2}")
                                .Bold()
                                .FontSize(14);
                        });
                });

            // Terms
            if (!string.IsNullOrWhiteSpace(proposal.Disclaimer))
            {
                column.Item().Text("Terms & Conditions").FontSize(14).Bold();
                column.Item().Text(proposal.Disclaimer).FontSize(10);
            }
        });
    }

    private void ComposeInvoiceContent(IContainer container, InvoiceResponseDto invoice)
    {
        container.Column(column =>
        {
            column.Spacing(20);

            // Payment status badge
            if (invoice.PaidAt.HasValue)
            {
                column
                    .Item()
                    .Text($"Paid on {invoice.PaidAt.Value:MMMM dd, yyyy}")
                    .FontSize(12)
                    .FontColor(Colors.Green.Medium);
            }

            // Line items table
            column.Item().Text("Items").FontSize(14).Bold();
            column
                .Item()
                .Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(1);
                        columns.RelativeColumn(1);
                        columns.RelativeColumn(1);
                    });

                    table.Header(header =>
                    {
                        header.Cell().Element(CellStyle).Text("Description").Bold();
                        header.Cell().Element(CellStyle).AlignRight().Text("Qty").Bold();
                        header.Cell().Element(CellStyle).AlignRight().Text("Price").Bold();
                        header.Cell().Element(CellStyle).AlignRight().Text("Total").Bold();

                        static IContainer CellStyle(IContainer container)
                        {
                            return container
                                .BorderBottom(1)
                                .BorderColor(Colors.Grey.Lighten2)
                                .PaddingVertical(5);
                        }
                    });

                    foreach (var item in invoice.LineItems)
                    {
                        table.Cell().Element(CellStyle).Text(item.Description);
                        table.Cell().Element(CellStyle).AlignRight().Text(item.Quantity.ToString());
                        table.Cell().Element(CellStyle).AlignRight().Text($"${item.UnitPrice:N2}");
                        table.Cell().Element(CellStyle).AlignRight().Text($"${item.Total:N2}");

                        static IContainer CellStyle(IContainer container)
                        {
                            return container
                                .BorderBottom(1)
                                .BorderColor(Colors.Grey.Lighten3)
                                .PaddingVertical(5);
                        }
                    }
                });

            // Totals
            column
                .Item()
                .AlignRight()
                .Column(totalsColumn =>
                {
                    totalsColumn
                        .Item()
                        .Row(row =>
                        {
                            row.AutoItem().Width(150).Text("Subtotal:").Bold();
                            row.AutoItem().Width(100).AlignRight().Text($"${invoice.Subtotal:N2}");
                        });

                    if (invoice.TaxPercent.HasValue && invoice.TaxPercent.Value > 0)
                    {
                        totalsColumn
                            .Item()
                            .Row(row =>
                            {
                                row.AutoItem()
                                    .Width(150)
                                    .Text($"Tax ({invoice.TaxPercent.Value}%):");
                                row.AutoItem()
                                    .Width(100)
                                    .AlignRight()
                                    .Text($"${invoice.TaxAmount:N2}");
                            });
                    }

                    totalsColumn
                        .Item()
                        .Row(row =>
                        {
                            row.AutoItem().Width(150).Text("Total Due:").Bold().FontSize(14);
                            row.AutoItem()
                                .Width(100)
                                .AlignRight()
                                .Text($"${invoice.Total:N2}")
                                .Bold()
                                .FontSize(14)
                                .FontColor(Colors.Red.Medium);
                        });
                });

            // Payment instructions
            if (!string.IsNullOrWhiteSpace(invoice.PaymentInstructions))
            {
                column.Item().Text("Payment Instructions").FontSize(14).Bold();
                column.Item().Text(invoice.PaymentInstructions).FontSize(10);
            }

            // Notes
            if (!string.IsNullOrWhiteSpace(invoice.Notes))
            {
                column.Item().Text("Notes").FontSize(14).Bold();
                column.Item().Text(invoice.Notes).FontSize(10);
            }
        });
    }

    private string GetStatusColor(string status)
    {
        return status switch
        {
            "Paid" => Colors.Green.Medium,
            "Unpaid" => Colors.Orange.Medium,
            "Overdue" => Colors.Red.Medium,
            "Cancelled" => Colors.Grey.Medium,
            _ => Colors.Black,
        };
    }
}
