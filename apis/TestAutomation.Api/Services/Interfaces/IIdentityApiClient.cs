namespace TestAutomation.Api.Services.Interfaces;

public interface IIdentityApiClient
{
    Task<UserInfo?> GetUserInfoAsync(string token);
    Task<bool> ValidateTokenAsync(string token);
    Task<List<string>> GetUserRolesAsync(string userId);
    Task<bool> HasRoleAsync(string userId, string role);
}