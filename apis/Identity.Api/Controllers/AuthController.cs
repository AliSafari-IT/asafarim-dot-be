using System.Security.Claims;
using Identity.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Identity.Api.Controllers;

/// <summary>
/// Professional SSO Authentication Controller with best practices
/// </summary>
[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly IOptions<AuthOptions> _authOptions;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        ITokenService tokenService,
        IRefreshTokenService refreshTokenService,
        IOptions<AuthOptions> authOptions,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _refreshTokenService = refreshTokenService;
        _authOptions = authOptions;
        _logger = logger;
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        // Check if user already exists
        var existingUser = await _userManager.FindByEmailAsync(req.Email);
        if (existingUser != null)
        {
            ModelState.AddModelError("Email", "Email is already registered");
            return ValidationProblem(ModelState);
        }

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = req.Email,
            UserName = req.UserName ?? req.Email,
            EmailConfirmed = false // Set to false, implement email confirmation
        };

        var result = await _userManager.CreateAsync(user, req.Password);
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }
            return ValidationProblem(ModelState);
        }

        _logger.LogInformation("User registered successfully: {Email}", req.Email);

        // Generate tokens
        var roleNames = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.CreateAccessToken(user, roleNames);
        var refreshToken = await _refreshTokenService.CreateRefreshTokenAsync(user.Id, GetIpAddress());

        // Set cookies
        SetAuthCookies(accessToken, refreshToken.Token, persistent: true, user);

        return Ok(CreateAuthResponse(user, roleNames, accessToken, refreshToken.Token));
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var user = await _userManager.FindByEmailAsync(req.Email);
        if (user == null)
        {
            _logger.LogWarning("Login attempt for non-existent user: {Email}", req.Email);
            return Unauthorized(new { message = "Invalid email or password" });
        }

        // Check if user needs to set password
        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            _logger.LogInformation("User needs password setup: {Email}", req.Email);
            return Ok(new
            {
                requiresPasswordSetup = true,
                userId = user.Id.ToString(),
                email = user.Email
            });
        }

        // Verify password
        var passwordValid = await _userManager.CheckPasswordAsync(user, req.Password);
        if (!passwordValid)
        {
            _logger.LogWarning("Failed login attempt for user: {Email}", req.Email);
            await _userManager.AccessFailedAsync(user); // Track failed attempts
            return Unauthorized(new { message = "Invalid email or password" });
        }

        // Check if account is locked
        if (await _userManager.IsLockedOutAsync(user))
        {
            _logger.LogWarning("Login attempt for locked account: {Email}", req.Email);
            return Unauthorized(new { message = "Account is locked. Please try again later." });
        }

        // Reset access failed count on successful login
        await _userManager.ResetAccessFailedCountAsync(user);

        _logger.LogInformation("User logged in successfully: {Email}", req.Email);

        // Generate tokens
        var roleNames = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.CreateAccessToken(user, roleNames);
        var refreshToken = await _refreshTokenService.CreateRefreshTokenAsync(user.Id, GetIpAddress());

        // Set cookies
        SetAuthCookies(accessToken, refreshToken.Token, persistent: req.RememberMe, user);

        return Ok(CreateAuthResponse(user, roleNames, accessToken, refreshToken.Token));
    }

    /// <summary>
    /// Logout and revoke refresh token
    /// </summary>
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout()
    {
        var ipAddress = GetIpAddress();

        // Try to get and revoke the refresh token
        if (Request.Cookies.TryGetValue("rtk", out var refreshToken) && !string.IsNullOrWhiteSpace(refreshToken))
        {
            await _refreshTokenService.RevokeRefreshTokenAsync(refreshToken, ipAddress);
            _logger.LogInformation("Refresh token revoked for IP: {IpAddress}", ipAddress);
        }

        // Clear cookies
        ClearAuthCookies();

        _logger.LogInformation("User logged out from IP: {IpAddress}", ipAddress);
        return Ok(new { message = "Logged out successfully" });
    }

    /// <summary>
    /// Get current authenticated user information
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(MeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        
        if (string.IsNullOrWhiteSpace(userId))
        {
            _logger.LogWarning("GetCurrentUser: No user ID in claims");
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            _logger.LogWarning("GetCurrentUser: User not found: {UserId}", userId);
            return Unauthorized();
        }

        var roleNames = await _userManager.GetRolesAsync(user);
        return Ok(new MeResponse(user.Id.ToString(), user.Email, user.UserName, roleNames.ToArray()));
    }

    /// <summary>
    /// Get current access token from cookie
    /// </summary>
    [HttpGet("token")]
    [ProducesResponseType(typeof(TokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult GetToken()
    {
        if (Request.Cookies.TryGetValue("atk", out var token) && !string.IsNullOrWhiteSpace(token))
        {
            return Ok(new TokenResponse { Token = token });
        }

        // Fallback to Authorization header
        var authHeader = Request.Headers["Authorization"].ToString();
        if (!string.IsNullOrWhiteSpace(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            var headerToken = authHeader.Substring("Bearer ".Length).Trim();
            if (!string.IsNullOrWhiteSpace(headerToken))
            {
                return Ok(new TokenResponse { Token = headerToken });
            }
        }

        return Unauthorized(new { message = "No token found" });
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken()
    {
        // Get refresh token from cookie
        if (!Request.Cookies.TryGetValue("rtk", out var refreshTokenString) || string.IsNullOrWhiteSpace(refreshTokenString))
        {
            _logger.LogWarning("RefreshToken: No refresh token in cookie");
            return Unauthorized(new { message = "No refresh token provided" });
        }

        // Validate refresh token
        var refreshToken = await _refreshTokenService.GetActiveRefreshTokenAsync(refreshTokenString);
        if (refreshToken == null)
        {
            _logger.LogWarning("RefreshToken: Invalid or expired refresh token");
            ClearAuthCookies();
            return Unauthorized(new { message = "Invalid or expired refresh token" });
        }

        var user = refreshToken.User;
        var ipAddress = GetIpAddress();

        // Rotate refresh token
        var newRefreshToken = await _refreshTokenService.RotateRefreshTokenAsync(refreshToken, ipAddress);
        if (newRefreshToken == null)
        {
            _logger.LogError("RefreshToken: Failed to rotate token for user {UserId}", user.Id);
            return Unauthorized(new { message = "Failed to refresh token" });
        }

        // Generate new access token
        var roleNames = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.CreateAccessToken(user, roleNames);

        // Set new cookies
        SetAuthCookies(accessToken, newRefreshToken.Token, persistent: true);

        _logger.LogInformation("Token refreshed for user: {Email}", user.Email);

        return Ok(CreateAuthResponse(user, roleNames, accessToken, newRefreshToken.Token));
    }

    /// <summary>
    /// Setup password for users created without password
    /// </summary>
    [HttpPost("setup-password")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SetupPassword([FromBody] SetupPasswordRequest req)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        if (string.IsNullOrEmpty(req.UserId) || string.IsNullOrEmpty(req.Password))
        {
            return BadRequest(new { message = "User ID and password are required" });
        }

        var user = await _userManager.FindByIdAsync(req.UserId);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        if (!string.IsNullOrEmpty(user.PasswordHash))
        {
            return BadRequest(new { message = "User already has a password set" });
        }

        var result = await _userManager.AddPasswordAsync(user, req.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => new { code = e.Code, description = e.Description }).ToList();
            return BadRequest(new { message = "Password validation failed", errors });
        }

        _logger.LogInformation("Password setup completed for user: {Email}", user.Email);

        // Generate tokens and log user in
        var roleNames = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.CreateAccessToken(user, roleNames);
        var refreshToken = await _refreshTokenService.CreateRefreshTokenAsync(user.Id, GetIpAddress());

        SetAuthCookies(accessToken, refreshToken.Token, persistent: true);

        return Ok(CreateAuthResponse(user, roleNames, accessToken, refreshToken.Token));
    }

    /// <summary>
    /// Revoke all refresh tokens for the current user (useful for security)
    /// </summary>
    [HttpPost("revoke-all")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> RevokeAllTokens()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId) || !Guid.TryParse(userId, out var userGuid))
        {
            return Unauthorized();
        }

        await _refreshTokenService.RevokeAllUserTokensAsync(userGuid, GetIpAddress());
        ClearAuthCookies();

        _logger.LogInformation("All tokens revoked for user: {UserId}", userId);
        return Ok(new { message = "All sessions revoked successfully" });
    }

    #region Private Helper Methods

    private void SetAuthCookies(string accessToken, string refreshToken, bool persistent, AppUser user)
    {
        var opts = _authOptions.Value;
        var isProdDomain = opts.CookieDomain?.EndsWith(".asafarim.be", StringComparison.OrdinalIgnoreCase) == true;
        var isHttps = Request.IsHttps;
        var useSecure = isProdDomain || isHttps;
        var sameSite = SameSiteMode.None; // Required for cross-subdomain SSO

        var accessExpiration = DateTime.UtcNow.AddMinutes(opts.AccessMinutes);
        var refreshExpiration = persistent
            ? DateTime.UtcNow.AddDays(opts.RefreshDays)
            : DateTime.UtcNow.AddHours(8);

        // Access token cookie
        Response.Cookies.Append("atk", accessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = useSecure,
            SameSite = sameSite,
            Domain = opts.CookieDomain,
            Path = "/",
            Expires = accessExpiration,
            MaxAge = TimeSpan.FromMinutes(opts.AccessMinutes)
        });

        // Refresh token cookie
        Response.Cookies.Append("rtk", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = useSecure,
            SameSite = sameSite,
            Domain = opts.CookieDomain,
            Path = "/",
            Expires = refreshExpiration,
            MaxAge = persistent ? TimeSpan.FromDays(opts.RefreshDays) : TimeSpan.FromHours(8)
        });

        // Language preference cookie (accessible by JavaScript)
        Response.Cookies.Append("preferredLanguage", user.PreferredLanguage ?? "en", new CookieOptions
        {
            HttpOnly = false, // Allow JavaScript access
            Secure = useSecure,
            SameSite = SameSiteMode.Lax,
            Domain = opts.CookieDomain,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddYears(1)
        });

        _logger.LogDebug("Auth cookies set - Domain: {Domain}, Secure: {Secure}, SameSite: {SameSite}, Persistent: {Persistent}, Language: {Language}",
            opts.CookieDomain, useSecure, sameSite, persistent, user.PreferredLanguage);
    }

    private void ClearAuthCookies()
    {
        var opts = _authOptions.Value;
        var isProdDomain = opts.CookieDomain?.EndsWith(".asafarim.be", StringComparison.OrdinalIgnoreCase) == true;
        var isHttps = Request.IsHttps;
        var useSecure = isProdDomain || isHttps;
        var sameSite = SameSiteMode.None;

        // Clear cookies with the configured domain (e.g., ".asafarim.be")
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = useSecure,
            SameSite = sameSite,
            Domain = opts.CookieDomain,
            Path = "/",
            Expires = DateTime.UtcNow.AddDays(-1) // Expire immediately
        };

        Response.Cookies.Delete("atk", cookieOptions);
        Response.Cookies.Delete("rtk", cookieOptions);
        
        // ALSO clear cookies without the leading dot for main domain (e.g., "asafarim.be")
        // This handles cases where cookies were set for the exact domain
        if (!string.IsNullOrEmpty(opts.CookieDomain) && opts.CookieDomain.StartsWith("."))
        {
            var exactDomain = opts.CookieDomain.TrimStart('.');
            var exactDomainOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = useSecure,
                SameSite = sameSite,
                Domain = exactDomain,
                Path = "/",
                Expires = DateTime.UtcNow.AddDays(-1)
            };
            
            Response.Cookies.Delete("atk", exactDomainOptions);
            Response.Cookies.Delete("rtk", exactDomainOptions);
            _logger.LogDebug("Also cleared cookies for exact domain: {Domain}", exactDomain);
        }
        
        // ALSO clear cookies without any domain specified (uses current host)
        var noDomainOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = useSecure,
            SameSite = sameSite,
            Path = "/",
            Expires = DateTime.UtcNow.AddDays(-1)
        };
        
        Response.Cookies.Delete("atk", noDomainOptions);
        Response.Cookies.Delete("rtk", noDomainOptions);

        Response.Headers.Append("Clear-Site-Data", "\"cookies\"");

        _logger.LogDebug("Auth cookies cleared for domain: {Domain}", opts.CookieDomain);
    }

    private string GetIpAddress()
    {
        // Check for forwarded IP first (behind proxy/load balancer)
        if (Request.Headers.ContainsKey("X-Forwarded-For"))
        {
            var forwardedFor = Request.Headers["X-Forwarded-For"].ToString();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                return forwardedFor.Split(',')[0].Trim();
            }
        }

        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    private AuthResponse CreateAuthResponse(AppUser user, IEnumerable<string> roles, string accessToken, string refreshToken)
    {
        var opts = _authOptions.Value;
        return new AuthResponse
        {
            Token = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(opts.AccessMinutes),
            User = new UserInfo
            {
                Id = user.Id.ToString(),
                Email = user.Email ?? "",
                FirstName = user.UserName ?? user.Email ?? "",
                LastName = "",
                Roles = roles.ToArray()
            }
        };
    }

    #endregion
}

#region Response DTOs

public class AuthResponse
{
    public string Token { get; set; } = default!;
    public string RefreshToken { get; set; } = default!;
    public DateTime ExpiresAt { get; set; }
    public UserInfo User { get; set; } = default!;
}

public class UserInfo
{
    public string Id { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;
    public string[] Roles { get; set; } = Array.Empty<string>();
}

public class TokenResponse
{
    public string Token { get; set; } = default!;
}

#endregion
