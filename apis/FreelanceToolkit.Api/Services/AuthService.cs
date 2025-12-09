using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AutoMapper;
using FreelanceToolkit.Api.DTOs;
using FreelanceToolkit.Api.Models;
using FreelanceToolkit.Api.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace FreelanceToolkit.Api.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly IMapper _mapper;
    private readonly IEmailService _emailService;
    private readonly Dictionary<string, string> _refreshTokens = new(); // In production, use Redis or database

    public AuthService(
        UserManager<ApplicationUser> userManager,
        IConfiguration _configuration,
        IMapper mapper,
        IEmailService emailService
    )
    {
        _userManager = userManager;
        this._configuration = _configuration;
        _mapper = mapper;
        _emailService = emailService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (dto.Password != dto.ConfirmPassword)
            throw new InvalidOperationException("Passwords do not match");

        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
            throw new InvalidOperationException("Email already registered");

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            CompanyName = dto.CompanyName,
            CreatedAt = DateTime.UtcNow,
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            throw new InvalidOperationException(
                string.Join(", ", result.Errors.Select(e => e.Description))
            );

        // Send welcome email
        await _emailService.SendWelcomeEmailAsync(user.Email, user.FirstName ?? user.Email);

        return await GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            throw new UnauthorizedAccessException("Invalid email or password");

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!isPasswordValid)
            throw new UnauthorizedAccessException("Invalid email or password");

        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        return await GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        if (!_refreshTokens.TryGetValue(refreshToken, out var userId))
            throw new UnauthorizedAccessException("Invalid refresh token");

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new UnauthorizedAccessException("User not found");

        // Remove old refresh token
        _refreshTokens.Remove(refreshToken);

        return await GenerateAuthResponse(user);
    }

    public async Task<bool> LogoutAsync(string userId)
    {
        // Remove all refresh tokens for this user
        var tokensToRemove = _refreshTokens
            .Where(kvp => kvp.Value == userId)
            .Select(kvp => kvp.Key)
            .ToList();
        foreach (var token in tokensToRemove)
        {
            _refreshTokens.Remove(token);
        }

        return await Task.FromResult(true);
    }

    public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto dto)
    {
        if (dto.NewPassword != dto.ConfirmNewPassword)
            throw new InvalidOperationException("Passwords do not match");

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new UnauthorizedAccessException("User not found");

        var result = await _userManager.ChangePasswordAsync(
            user,
            dto.CurrentPassword,
            dto.NewPassword
        );
        if (!result.Succeeded)
            throw new InvalidOperationException(
                string.Join(", ", result.Errors.Select(e => e.Description))
            );

        return true;
    }

    public async Task<bool> ForgotPasswordAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
            return true; // Don't reveal if email exists

        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
        var resetLink =
            $"https://freelance-toolkit.asafarim.be/reset-password?token={Uri.EscapeDataString(resetToken)}&email={Uri.EscapeDataString(email)}";

        await _emailService.SendPasswordResetEmailAsync(email, resetLink);

        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordDto dto)
    {
        if (dto.NewPassword != dto.ConfirmNewPassword)
            throw new InvalidOperationException("Passwords do not match");

        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            throw new InvalidOperationException("Invalid reset request");

        var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
        if (!result.Succeeded)
            throw new InvalidOperationException(
                string.Join(", ", result.Errors.Select(e => e.Description))
            );

        return true;
    }

    public async Task<UserProfileDto?> GetUserProfileAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        return user == null ? null : _mapper.Map<UserProfileDto>(user);
    }

    public async Task<UserProfileDto> UpdateUserProfileAsync(
        string userId,
        UpdateUserProfileDto dto
    )
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new UnauthorizedAccessException("User not found");

        if (dto.FirstName != null)
            user.FirstName = dto.FirstName;
        if (dto.LastName != null)
            user.LastName = dto.LastName;
        if (dto.CompanyName != null)
            user.CompanyName = dto.CompanyName;
        if (dto.LogoUrl != null)
            user.LogoUrl = dto.LogoUrl;

        await _userManager.UpdateAsync(user);

        return _mapper.Map<UserProfileDto>(user);
    }

    private async Task<AuthResponseDto> GenerateAuthResponse(ApplicationUser user)
    {
        var token = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();

        _refreshTokens[refreshToken] = user.Id;

        var jwtConfig = _configuration.GetSection("Jwt");
        var expiryMinutes = int.Parse(jwtConfig["ExpiryMinutes"] ?? "60");

        return new AuthResponseDto
        {
            Token = token,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes),
            User = _mapper.Map<UserDto>(user),
        };
    }

    private string GenerateJwtToken(ApplicationUser user)
    {
        var jwtConfig = _configuration.GetSection("Jwt");
        var key = Encoding.UTF8.GetBytes(jwtConfig["Key"]!);
        var issuer = jwtConfig["Issuer"];
        var audience = jwtConfig["Audience"];
        var expiryMinutes = int.Parse(jwtConfig["ExpiryMinutes"] ?? "60");

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email!),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        if (!string.IsNullOrEmpty(user.FirstName))
            claims.Add(new Claim(ClaimTypes.GivenName, user.FirstName));

        if (!string.IsNullOrEmpty(user.LastName))
            claims.Add(new Claim(ClaimTypes.Surname, user.LastName));

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(expiryMinutes),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature
            ),
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}
