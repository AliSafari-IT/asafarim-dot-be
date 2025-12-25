using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TaskManagement.Api.DTOs;

namespace TaskManagement.Api.Services;

public class UserService : IUserService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<UserService> _logger;

    public UserService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<UserService> logger
    )
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<UserLookupDto?> GetUserByEmailAsync(string email)
    {
        try
        {
            var identityApiUrl = _configuration["IdentityApiUrl"] ?? "https://identity.asafarim.be";
            var encodedEmail = Uri.EscapeDataString(email);
            var url = $"{identityApiUrl}/users/by-email/{encodedEmail}";

            _logger.LogInformation("Looking up user by email: {Email} at {Url}", email, url);

            var response = await _httpClient.GetAsync(url);

            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                _logger.LogInformation("User not found with email: {Email}", email);
                return null;
            }

            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var user = JsonSerializer.Deserialize<UserLookupDto>(
                content,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );

            _logger.LogInformation("User found: {UserId} for email: {Email}", user?.Id, email);
            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error looking up user by email: {Email}", email);
            throw;
        }
    }
}
