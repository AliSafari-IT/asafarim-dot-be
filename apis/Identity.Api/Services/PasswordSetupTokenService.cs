using Identity.Api.Data;
using Identity.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Identity.Api.Services;

/// <summary>
/// Service for managing password setup tokens (magic links)
/// </summary>
public interface IPasswordSetupTokenService
{
    /// <summary>
    /// Generate a new password setup token for a user
    /// </summary>
    Task<string> GenerateTokenAsync(Guid userId, int expirationMinutes = 1440); // 24 hours default

    /// <summary>
    /// Validate a password setup token without consuming it
    /// </summary>
    Task<(bool IsValid, Guid? UserId, string? Email)> ValidateTokenAsync(string token);

    /// <summary>
    /// Validate and consume a password setup token
    /// </summary>
    Task<(bool IsValid, Guid? UserId)> ValidateAndConsumeTokenAsync(string token);

    /// <summary>
    /// Revoke all existing tokens for a user
    /// </summary>
    Task RevokeUserTokensAsync(Guid userId);
}

public class PasswordSetupTokenService : IPasswordSetupTokenService
{
    private readonly AppDbContext _context;
    private readonly ILogger<PasswordSetupTokenService> _logger;

    public PasswordSetupTokenService(
        AppDbContext context,
        ILogger<PasswordSetupTokenService> logger
    )
    {
        _context = context;
        _logger = logger;
    }

    public async Task<string> GenerateTokenAsync(Guid userId, int expirationMinutes = 1440)
    {
        try
        {
            // Revoke any existing tokens for this user
            await RevokeUserTokensAsync(userId);

            // Generate a secure random token (URL-safe)
            var tokenBytes = new byte[32];
            using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
            {
                rng.GetBytes(tokenBytes);
            }
            var token = Convert
                .ToBase64String(tokenBytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");

            var passwordSetupToken = new PasswordSetupToken
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Token = token,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes),
                IsUsed = false,
            };

            _context.PasswordSetupTokens.Add(passwordSetupToken);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Generated password setup token for user {UserId}, expires in {Minutes} minutes",
                userId,
                expirationMinutes
            );
            return token;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating password setup token for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Validate a password setup token without consuming it
    /// </summary>
    public async Task<(bool IsValid, Guid? UserId, string? Email)> ValidateTokenAsync(string token)
    {
        try
        {
            var setupToken = await _context.PasswordSetupTokens.FirstOrDefaultAsync(t =>
                t.Token == token
            );

            if (setupToken == null)
            {
                _logger.LogWarning("Password setup token not found: {Token}", token[..10] + "...");
                return (false, null, null);
            }

            if (setupToken.IsUsed || setupToken.ExpiresAt <= DateTime.UtcNow)
            {
                _logger.LogWarning(
                    "Password setup token is invalid (expired or already used): {Token}",
                    token[..10] + "..."
                );
                return (false, null, null);
            }

            // Get user email for display
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == setupToken.UserId);
            var email = user?.Email;

            _logger.LogInformation(
                "Password setup token validated for user {UserId}",
                setupToken.UserId
            );
            return (true, setupToken.UserId, email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating password setup token");
            throw;
        }
    }

    public async Task<(bool IsValid, Guid? UserId)> ValidateAndConsumeTokenAsync(string token)
    {
        try
        {
            var setupToken = await _context.PasswordSetupTokens.FirstOrDefaultAsync(t =>
                t.Token == token
            );

            if (setupToken == null)
            {
                _logger.LogWarning("Password setup token not found: {Token}", token[..10] + "...");
                return (false, null);
            }

            if (setupToken.IsUsed || setupToken.ExpiresAt <= DateTime.UtcNow)
            {
                _logger.LogWarning(
                    "Password setup token is invalid (expired or already used): {Token}",
                    token[..10] + "..."
                );
                return (false, null);
            }

            // Mark token as used
            setupToken.IsUsed = true;
            setupToken.UsedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Password setup token consumed for user {UserId}",
                setupToken.UserId
            );
            return (true, setupToken.UserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating password setup token");
            throw;
        }
    }

    public async Task RevokeUserTokensAsync(Guid userId)
    {
        try
        {
            var now = DateTime.UtcNow;
            var tokens = await _context
                .PasswordSetupTokens.Where(t =>
                    t.UserId == userId && !t.IsUsed && t.ExpiresAt > now
                )
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.IsUsed = true;
                token.UsedAt = DateTime.UtcNow;
            }

            if (tokens.Any())
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation(
                    "Revoked {Count} password setup tokens for user {UserId}",
                    tokens.Count,
                    userId
                );
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking password setup tokens for user {UserId}", userId);
            throw;
        }
    }
}
