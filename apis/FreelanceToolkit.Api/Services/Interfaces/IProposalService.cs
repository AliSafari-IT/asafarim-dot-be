using FreelanceToolkit.Api.DTOs.Proposal;

namespace FreelanceToolkit.Api.Services.Interfaces;

public interface IProposalService
{
    Task<ProposalResponseDto> CreateAsync(CreateProposalDto dto, string userId);
    Task<ProposalResponseDto> GetByIdAsync(Guid id, string userId);
    Task<List<ProposalResponseDto>> GetAllAsync(
        string userId,
        string? status = null,
        Guid? clientId = null
    );
    Task<ProposalResponseDto> UpdateAsync(Guid id, UpdateProposalDto dto, string userId);
    Task DeleteAsync(Guid id, string userId);
    Task<ProposalResponseDto> SendAsync(Guid id, string userId);
    Task<ProposalResponseDto> AcceptAsync(Guid id, string userId);
    Task<ProposalResponseDto> RejectAsync(Guid id, string userId);
    Task<ProposalResponseDto> CreateVersionAsync(Guid id, string userId);
    Task<List<ProposalVersionDto>> GetVersionsAsync(Guid id, string userId);
    Task<string> GenerateHtmlAsync(Guid id, string userId);

    // Template methods
    Task<ProposalTemplateDto> CreateTemplateAsync(ProposalTemplateDto dto, string userId);
    Task<List<ProposalTemplateDto>> GetTemplatesAsync(string userId);
    Task<ProposalTemplateDto> GetTemplateByIdAsync(Guid id, string userId);
    Task DeleteTemplateAsync(Guid id, string userId);
}
