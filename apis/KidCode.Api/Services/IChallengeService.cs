using KidCode.Api.DTOs;

namespace KidCode.Api.Services;

public interface IChallengeService
{
    Task<List<ChallengeDto>> GetChallengesAsync(string? mode = null, int? level = null);
    Task<ChallengeDto?> GetDailyChallengeAsync();
}
