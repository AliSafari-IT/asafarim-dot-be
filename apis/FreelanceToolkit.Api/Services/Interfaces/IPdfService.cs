namespace FreelanceToolkit.Api.Services.Interfaces;

public interface IPdfService
{
    Task<byte[]> GenerateProposalPdfAsync(Guid proposalId, string userId);
    Task<byte[]> GenerateInvoicePdfAsync(Guid invoiceId, string userId);
}
