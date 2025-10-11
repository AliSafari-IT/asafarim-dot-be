using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Identity.Api;

/// <summary>
/// Service for creating and validating JWT tokens
/// </summary>
public interface ITokenService
{
    string CreateAccessToken(AppUser user, IEnumerable<string> roles);
    ClaimsPrincipal? ValidateToken(string token, bool validateLifetime = true);
    Guid? ExtractUserIdFromToken(string token);
}

public class TokenService : ITokenService
{
    private readonly AuthOptions _authOptions;
    private readonly ILogger<TokenService> _logger;
    private readonly TokenValidationParameters _validationParameters;

    public TokenService(IOptions<AuthOptions> authOptions, ILogger<TokenService> logger)
    {
        _authOptions = authOptions.Value;
        _logger = logger;
        
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_authOptions.Key));
        _validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = _authOptions.Issuer,
            ValidAudience = _authOptions.Audience,
            IssuerSigningKey = key,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    }

    public string CreateAccessToken(AppUser user, IEnumerable<string> roles)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_authOptions.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Unique token ID
            new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            new(JwtRegisteredClaimNames.UniqueName, user.UserName ?? user.Email ?? "user"),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email ?? "")
        };
        
        if (roles != null)
        {
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }
        }
        
        var token = new JwtSecurityToken(
            issuer: _authOptions.Issuer,
            audience: _authOptions.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddMinutes(_authOptions.AccessMinutes),
            signingCredentials: creds
        );
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public ClaimsPrincipal? ValidateToken(string token, bool validateLifetime = true)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var validationParams = _validationParameters.Clone();
            validationParams.ValidateLifetime = validateLifetime;
            
            var principal = handler.ValidateToken(token, validationParams, out var validatedToken);
            
            // Ensure the token is a JWT and uses the correct algorithm
            if (validatedToken is not JwtSecurityToken jwtToken ||
                !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                _logger.LogWarning("Invalid token algorithm");
                return null;
            }
            
            return principal;
        }
        catch (SecurityTokenExpiredException)
        {
            _logger.LogDebug("Token expired");
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Token validation failed");
            return null;
        }
    }

    public Guid? ExtractUserIdFromToken(string token)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            var subClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "sub" || c.Type == ClaimTypes.NameIdentifier);
            
            if (subClaim != null && Guid.TryParse(subClaim.Value, out var userId))
            {
                return userId;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to extract user ID from token");
        }
        
        return null;
    }
}

// Keep static helper for backward compatibility during migration
public static class TokenServiceHelper
{
    public static string CreateAccessToken(AppUser user, IEnumerable<string> roles, AuthOptions opts)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(opts.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, user.UserName ?? user.Email ?? "user"),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email ?? "")
        };
        if (roles != null)
        {
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }
        }
        var token = new JwtSecurityToken(
            issuer: opts.Issuer,
            audience: opts.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(opts.AccessMinutes),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}