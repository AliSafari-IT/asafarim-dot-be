using TestAutomation.Api.DTOs;

namespace TestAutomation.Api.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
    Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto);
    Task<UserDto?> GetUserByIdAsync(string userId);
    Task<List<UserDto>> GetAllUsersAsync();
    Task<bool> UpdateUserRoleAsync(string userId, string newRole);
    Task<bool> DeactivateUserAsync(string userId);
}