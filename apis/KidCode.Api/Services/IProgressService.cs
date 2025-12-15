using KidCode.Api.DTOs;

namespace KidCode.Api.Services;

public interface IProgressService
{
    Task<ProgressDto> GetProgressAsync(string userId);
    Task<ProgressDto> UpdateProgressAsync(string userId, UpdateProgressDto dto);
    Task<List<LeaderboardEntryDto>> GetLeaderboardAsync(string mode, int limit = 10);
}
