using KidCode.Api.DTOs;

namespace KidCode.Api.Services;

public interface IProgressService
{
    Task<ProgressDto> GetProgressAsync(string userId);
    Task<ProgressDto> UpdateProgressAsync(string userId, UpdateProgressDto dto);
}
