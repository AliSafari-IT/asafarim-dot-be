using FreelanceToolkit.Api.DTOs.Client;

namespace FreelanceToolkit.Api.Services.Interfaces;

public interface IClientService
{
    Task<ClientResponseDto> CreateAsync(CreateClientDto dto, string userId);
    Task<ClientResponseDto> GetByIdAsync(Guid id, string userId);
    Task<List<ClientResponseDto>> GetAllAsync(
        string userId,
        string? search = null,
        List<string>? tags = null
    );
    Task<ClientResponseDto> UpdateAsync(Guid id, UpdateClientDto dto, string userId);
    Task DeleteAsync(Guid id, string userId);
    Task<bool> ExistsAsync(Guid id, string userId);
}
