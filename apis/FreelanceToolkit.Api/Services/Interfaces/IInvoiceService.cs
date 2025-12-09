using FreelanceToolkit.Api.DTOs.Invoice;

namespace FreelanceToolkit.Api.Services.Interfaces;

public interface IInvoiceService
{
    Task<InvoiceResponseDto> CreateAsync(CreateInvoiceDto dto, string userId);
    Task<InvoiceResponseDto> GetByIdAsync(Guid id, string userId);
    Task<List<InvoiceResponseDto>> GetAllAsync(
        string userId,
        string? status = null,
        Guid? clientId = null
    );
    Task<InvoiceResponseDto> UpdateAsync(Guid id, UpdateInvoiceDto dto, string userId);
    Task DeleteAsync(Guid id, string userId);
    Task<InvoiceResponseDto> MarkAsPaidAsync(Guid id, string userId);
    Task<InvoiceResponseDto> MarkAsCancelledAsync(Guid id, string userId);
    Task<InvoiceResponseDto> SendAsync(Guid id, string userId);
    Task UpdateOverdueStatusesAsync(string userId);
    Task<string> GenerateHtmlAsync(Guid id, string userId);
}
