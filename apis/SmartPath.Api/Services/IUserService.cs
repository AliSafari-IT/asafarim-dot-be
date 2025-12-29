using SmartPath.Api.Entities;

namespace SmartPath.Api.Services;

public interface IUserService
{
    Task<User> GetOrCreateLocalUserAsync(string identityUserId, string? email = null, string? displayName = null);
    Task<User?> GetByIdAsync(int userId);
    Task<List<User>> GetByIdsAsync(List<int> userIds);
}
