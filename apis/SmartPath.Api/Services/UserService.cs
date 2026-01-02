using Microsoft.EntityFrameworkCore;
using SmartPath.Api.Data;
using SmartPath.Api.DTOs;
using SmartPath.Api.Entities;

namespace SmartPath.Api.Services;

public class UserService : IUserService
{
    private readonly SmartPathDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<UserService> _logger;

    public UserService(
        SmartPathDbContext context,
        IHttpClientFactory httpClientFactory,
        ILogger<UserService> logger
    )
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<User> GetOrCreateLocalUserAsync(
        string identityUserId,
        string? email = null,
        string? displayName = null
    )
    {
        var user = await _context.Users.FirstOrDefaultAsync(u =>
            u.IdentityUserId == identityUserId
        );

        if (user == null)
        {
            // Create user from JWT claims data
            user = new User
            {
                IdentityUserId = identityUserId,
                Email = email ?? "unknown@example.com",
                DisplayName = displayName ?? email ?? "Unknown User",
                PreferredLanguage = "en",
                LastSyncedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            _logger.LogInformation(
                "Created local user for Identity user {IdentityUserId}: {Email}",
                identityUserId,
                email
            );
        }

        return user;
    }

    public async Task<User?> GetByIdAsync(int userId)
    {
        return await _context.Users.FindAsync(userId);
    }

    public async Task<List<User>> GetByIdsAsync(List<int> userIds)
    {
        return await _context.Users.Where(u => userIds.Contains(u.UserId)).ToListAsync();
    }
}
