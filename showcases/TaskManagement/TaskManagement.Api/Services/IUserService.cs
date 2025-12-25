using TaskManagement.Api.DTOs;

namespace TaskManagement.Api.Services;

public interface IUserService
{
    Task<UserLookupDto?> GetUserByEmailAsync(string email);
}
