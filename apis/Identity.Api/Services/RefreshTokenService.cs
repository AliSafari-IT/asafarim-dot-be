using System.Security.Cryptography;
using Identity.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Identity.Api.Services;

/// <summary>
/// Service for managing refresh tokens with rotation and revocation
/// </summary>
public interface IRefreshTokenService
{
    Task<RefreshToken> CreateRefreshTokenAsync(Guid userId, string ipAddress);
    Task<RefreshToken?> GetActiveRefreshTokenAsync(string token);
    Task<RefreshToken?> RotateRefreshTokenAsync(RefreshToken oldToken, string ipAddress);
    Task RevokeRefreshTokenAsync(string token, string ipAddress, string? replacedByToken = null);
    Task RevokeAllUserTokensAsync(Guid userId, string ipAddress);
    Task CleanupExpiredTokensAsync();
}

public class RefreshTokenService : IRefreshTokenService
{
    private readonly AppDbContext _context;
    private readonly ILogger<RefreshTokenService> _logger;

    public RefreshTokenService(AppDbContext context, ILogger<RefreshTokenService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<RefreshToken> CreateRefreshTokenAsync(Guid userId, string ipAddress)
    {
        var token = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Token = GenerateSecureToken(),
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            CreatedByIp = ipAddress,
            IsRevoked = false
        };

        _context.RefreshTokens.Add(token);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created refresh token for user {UserId} from IP {IpAddress}", userId, ipAddress);
        return token;
    }

    public async Task<RefreshToken?> GetActiveRefreshTokenAsync(string token)
    {
        var refreshToken = await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == token);

        if (refreshToken == null)
        {
            _logger.LogWarning("Refresh token not found: {Token}", token.Substring(0, Math.Min(10, token.Length)));
            return null;
        }

        if (!refreshToken.IsActive)
        {
            _logger.LogWarning("Inactive refresh token used: {Token}, Revoked: {IsRevoked}, Expired: {IsExpired}", 
                token.Substring(0, Math.Min(10, token.Length)), refreshToken.IsRevoked, refreshToken.IsExpired);
            return null;
        }

        return refreshToken;
    }

    public async Task<RefreshToken?> RotateRefreshTokenAsync(RefreshToken oldToken, string ipAddress)
    {
        if (!oldToken.IsActive)
        {
            _logger.LogWarning("Attempted to rotate inactive token for user {UserId}", oldToken.UserId);
            return null;
        }

        // Create new token
        var newToken = await CreateRefreshTokenAsync(oldToken.UserId, ipAddress);

        // Revoke old token
        oldToken.IsRevoked = true;
        oldToken.RevokedAt = DateTime.UtcNow;
        oldToken.RevokedByIp = ipAddress;
        oldToken.ReplacedByToken = newToken.Token;

        _context.RefreshTokens.Update(oldToken);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Rotated refresh token for user {UserId}", oldToken.UserId);
        return newToken;
    }

    public async Task RevokeRefreshTokenAsync(string token, string ipAddress, string? replacedByToken = null)
    {
        var refreshToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == token);

        if (refreshToken == null || !refreshToken.IsActive)
        {
            _logger.LogWarning("Attempted to revoke non-existent or inactive token");
            return;
        }

        refreshToken.IsRevoked = true;
        refreshToken.RevokedAt = DateTime.UtcNow;
        refreshToken.RevokedByIp = ipAddress;
        refreshToken.ReplacedByToken = replacedByToken;

        _context.RefreshTokens.Update(refreshToken);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Revoked refresh token for user {UserId}", refreshToken.UserId);
    }

    public async Task RevokeAllUserTokensAsync(Guid userId, string ipAddress)
    {
        var tokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.IsActive)
            .ToListAsync();

        foreach (var token in tokens)
        {
            token.IsRevoked = true;
            token.RevokedAt = DateTime.UtcNow;
            token.RevokedByIp = ipAddress;
        }

        _context.RefreshTokens.UpdateRange(tokens);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Revoked all refresh tokens for user {UserId}, count: {Count}", userId, tokens.Count);
    }

    public async Task CleanupExpiredTokensAsync()
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-60); // Keep expired tokens for 60 days for audit
        var expiredTokens = await _context.RefreshTokens
            .Where(rt => rt.ExpiresAt < cutoffDate)
            .ToListAsync();

        if (expiredTokens.Any())
        {
            _context.RefreshTokens.RemoveRange(expiredTokens);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Cleaned up {Count} expired refresh tokens", expiredTokens.Count);
        }
    }

    private static string GenerateSecureToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }
}
