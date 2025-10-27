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
    private readonly IPasswordSetupTokenService _passwordSetupTokenService;
    private readonly IEmailService _emailService;
    private readonly IOptions<AuthOptions> _authOptions;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        ITokenService tokenService,
        IRefreshTokenService refreshTokenService,
        IPasswordSetupTokenService passwordSetupTokenService,
        IEmailService emailService,
        IOptions<AuthOptions> authOptions,
        ILogger<AuthController> logger
    )
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _refreshTokenService = refreshTokenService;
        _passwordSetupTokenService = passwordSetupTokenService;
        _emailService = emailService;
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
            EmailConfirmed = false, // Set to false, implement email confirmation
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
        var refreshToken = await _refreshTokenService.CreateRefreshTokenAsync(
            user.Id,
            GetIpAddress()
        );

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
            return Unauthorized(
                new { message = "Invalid email or password", code = "user_not_found" }
            );
        }

        // Check if user needs to set password
        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            _logger.LogInformation("User needs password setup: {Email}", req.Email);
            return Ok(
                new
                {
                    requiresPasswordSetup = true,
                    userId = user.Id.ToString(),
                    email = user.Email,
                }
            );
        }

        // Verify password
        var passwordValid = await _userManager.CheckPasswordAsync(user, req.Password);
        if (!passwordValid)
        {
            _logger.LogWarning("Failed login attempt for user: {Email}", req.Email);
            await _userManager.AccessFailedAsync(user); // Track failed attempts
            return Unauthorized(
                new { message = "Invalid email or password", code = "invalid_credentials" }
            );
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
        var refreshToken = await _refreshTokenService.CreateRefreshTokenAsync(
            user.Id,
            GetIpAddress()
        );

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
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown";

        // Get user ID before clearing cookies (for logging purposes only)
        var userId =
            User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "anonymous";

        _logger.LogInformation(
            "🚪 LOGOUT STARTED - Environment: {Environment}, IP: {IpAddress}, User: {UserId}",
            environment,
            ipAddress,
            userId
        );

        // Log all cookies received BEFORE clearing
        _logger.LogInformation(
            "📥 Cookies before logout: {Cookies}",
            string.Join(
                ", ",
                Request.Cookies.Select(c =>
                    $"{c.Key}={c.Value?.Substring(0, Math.Min(8, c.Value.Length))}..."
                )
            )
        );

        // Get refresh token BEFORE clearing cookies
        string? refreshToken = null;
        if (Request.Cookies.TryGetValue("rtk", out var rtkValue))
        {
            refreshToken = rtkValue;
            _logger.LogInformation("🔑 Found refresh token cookie (rtk) - will revoke in database");
        }
        else
        {
            _logger.LogWarning("⚠️ No refresh token cookie (rtk) found");
        }

        // STEP 1: Clear custom auth cookies (JWT tokens) IMMEDIATELY
        // This prevents race conditions with pending refresh requests
        ClearAuthCookies();
        _logger.LogInformation("🍪 Custom auth cookies cleared");

        // STEP 2: Revoke the refresh token in the database
        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            await _refreshTokenService.RevokeRefreshTokenAsync(refreshToken, ipAddress);
            _logger.LogInformation(
                "✅ Refresh token revoked in database for IP: {IpAddress}",
                ipAddress
            );
        }
        else
        {
            _logger.LogInformation("⏭️ No refresh token to revoke in database");
        }

        // VERIFICATION: Log Set-Cookie headers sent to browser (development only)
        if (environment == "Development")
        {
            var setCookieHeaders = Response
                .Headers.Where(h => h.Key == "Set-Cookie")
                .SelectMany(h => h.Value)
                .ToList();
            _logger.LogInformation(
                "📤 DEVELOPMENT: Set-Cookie headers sent to browser: {Count} headers",
                setCookieHeaders.Count
            );

            foreach (var header in setCookieHeaders.Take(5)) // Log first 5 to avoid spam
            {
                _logger.LogDebug("📤 Set-Cookie: {Header}", header);
            }

            // Verify we have cookie clearing headers for each auth cookie
            var authCookieNames = new[] { "atk", "rtk", "preferredLanguage" };
            var clearedCookies = authCookieNames
                .Where(name =>
                    setCookieHeaders.Any(h =>
                        h != null && (h.StartsWith($"{name}=;") || h.StartsWith($"{name}=\"\";"))
                    )
                )
                .ToList();

            if (clearedCookies.Count == authCookieNames.Length)
            {
                _logger.LogInformation(
                    "✅ DEVELOPMENT: All {Count} auth cookies have clearing headers",
                    authCookieNames.Length
                );
            }
            else
            {
                _logger.LogWarning(
                    "⚠️ DEVELOPMENT: Missing clearing headers for cookies: {Missing}",
                    string.Join(", ", authCookieNames.Except(clearedCookies))
                );
            }
        }

        _logger.LogInformation(
            "🚪 LOGOUT COMPLETED - User logged out from IP: {IpAddress}",
            ipAddress
        );

        return Ok(
            new
            {
                message = "Logged out successfully",
                environment = environment,
                timestamp = DateTime.UtcNow,
            }
        );
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
        // NOTE: The [Authorize] attribute already validates the JWT access token
        // We don't need to validate the refresh token here - that's only needed for token refresh
        // Validating refresh token here causes false logouts when cookies are set but not yet in DB

        var userId =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;

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
        return Ok(
            new MeResponse(user.Id.ToString(), user.Email, user.UserName, roleNames.ToArray())
        );
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
        if (
            !string.IsNullOrWhiteSpace(authHeader)
            && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
        )
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
        if (
            !Request.Cookies.TryGetValue("rtk", out var refreshTokenString)
            || string.IsNullOrWhiteSpace(refreshTokenString)
        )
        {
            _logger.LogWarning("RefreshToken: No refresh token in cookie");
            return Unauthorized(new { message = "No refresh token provided" });
        }

        // Validate refresh token
        var refreshToken = await _refreshTokenService.GetActiveRefreshTokenAsync(
            refreshTokenString
        );
        if (refreshToken == null)
        {
            _logger.LogWarning("RefreshToken: Invalid or expired refresh token");
            ClearAuthCookies();
            return Unauthorized(new { message = "Invalid or expired refresh token" });
        }

        var user = refreshToken.User;
        var ipAddress = GetIpAddress();

        // Rotate refresh token
        var newRefreshToken = await _refreshTokenService.RotateRefreshTokenAsync(
            refreshToken,
            ipAddress
        );
        if (newRefreshToken == null)
        {
            _logger.LogError("RefreshToken: Failed to rotate token for user {UserId}", user.Id);
            return Unauthorized(new { message = "Failed to refresh token" });
        }

        // Generate new access token
        var roleNames = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.CreateAccessToken(user, roleNames);

        // Set new cookies
        SetAuthCookies(accessToken, newRefreshToken.Token, persistent: true, user);

        _logger.LogInformation("Token refreshed for user: {Email}", user.Email);

        return Ok(CreateAuthResponse(user, roleNames, accessToken, newRefreshToken.Token));
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

    private void SetAuthCookies(
        string accessToken,
        string refreshToken,
        bool persistent,
        AppUser user
    )
    {
        var opts = _authOptions.Value;
        var isProdDomain =
            opts.CookieDomain?.EndsWith(".asafarim.be", StringComparison.OrdinalIgnoreCase) == true;
        var isHttps = Request.IsHttps;
        var useSecure = isProdDomain || isHttps;

        // SameSite=None requires Secure=true, which requires HTTPS
        // In development (HTTP), use Lax instead to allow cookies to work
        var sameSite = useSecure ? SameSiteMode.None : SameSiteMode.Lax;

        var accessExpiration = DateTime.UtcNow.AddMinutes(opts.AccessMinutes);
        var refreshExpiration = persistent
            ? DateTime.UtcNow.AddDays(opts.RefreshDays)
            : DateTime.UtcNow.AddHours(8);

        // Access token cookie
        Response.Cookies.Append(
            "atk",
            accessToken,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = useSecure,
                SameSite = sameSite,
                Domain = opts.CookieDomain,
                Path = "/",
                Expires = accessExpiration,
                MaxAge = TimeSpan.FromMinutes(opts.AccessMinutes),
            }
        );

        // Refresh token cookie
        Response.Cookies.Append(
            "rtk",
            refreshToken,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = useSecure,
                SameSite = sameSite,
                Domain = opts.CookieDomain,
                Path = "/",
                Expires = refreshExpiration,
                MaxAge = persistent ? TimeSpan.FromDays(opts.RefreshDays) : TimeSpan.FromHours(8),
            }
        );

        // Language preference cookie (accessible by JavaScript)
        Response.Cookies.Append(
            "preferredLanguage",
            user.PreferredLanguage ?? "en",
            new CookieOptions
            {
                HttpOnly = false, // Allow JavaScript access
                Secure = useSecure,
                SameSite = SameSiteMode.Lax,
                Domain = opts.CookieDomain,
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddYears(1),
            }
        );

        _logger.LogDebug(
            "Auth cookies set - Domain: {Domain}, Secure: {Secure}, SameSite: {SameSite}, Persistent: {Persistent}, Language: {Language}",
            opts.CookieDomain,
            useSecure,
            sameSite,
            persistent,
            user.PreferredLanguage
        );
    }

    private void ClearAuthCookies()
    {
        var opts = _authOptions.Value;
        var isProdDomain =
            opts.CookieDomain?.EndsWith(".asafarim.be", StringComparison.OrdinalIgnoreCase) == true;
        var isHttps = Request.IsHttps;
        var useSecure = isProdDomain || isHttps;
        var sameSite = useSecure ? SameSiteMode.None : SameSiteMode.Lax;

        _logger.LogInformation(
            "🍪 CLEARING COOKIES - Environment: {Environment}, Domain: {Domain}, Secure: {Secure}, SameSite: {SameSite}, Host: {Host}",
            Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
            opts.CookieDomain ?? "null",
            useSecure,
            sameSite,
            Request.Host.Host
        );

        // Log current cookies being sent by browser
        _logger.LogInformation(
            "📥 Cookies received from browser: {Cookies}",
            string.Join(
                ", ",
                Request.Cookies.Select(c =>
                    $"{c.Key}={c.Value?.Substring(0, Math.Min(10, c.Value.Length))}..."
                )
            )
        );

        var expiredDate = DateTimeOffset.UtcNow.AddDays(-1);
        var cookieNames = new[] { "atk", "rtk", "preferredLanguage" };

        // Use exact same parameters as when cookies were set
        foreach (var cookieName in cookieNames)
        {
            var isLanguageCookie = cookieName == "preferredLanguage";

            Response.Cookies.Append(
                cookieName,
                "", // Empty value
                new CookieOptions
                {
                    HttpOnly = !isLanguageCookie, // Language cookie is not HttpOnly
                    Secure = useSecure,
                    SameSite = isLanguageCookie ? SameSiteMode.Lax : sameSite, // Language cookie always uses Lax
                    Domain = opts.CookieDomain,
                    Path = "/",
                    Expires = expiredDate,
                    MaxAge = TimeSpan.Zero, // Immediate expiration
                }
            );

            _logger.LogInformation(
                "✅ Cookie {CookieName} cleared with Domain={Domain}, HttpOnly={HttpOnly}, Secure={Secure}, SameSite={SameSite}",
                cookieName,
                opts.CookieDomain ?? "null",
                !isLanguageCookie,
                useSecure,
                isLanguageCookie ? "Lax" : sameSite.ToString()
            );
        }

        // DEVELOPMENT: Additional safeguards for localhost/.local domains
        if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
        {
            _logger.LogInformation("🔧 DEVELOPMENT: Adding additional cookie clearing safeguards");

            // APPROACH 1: Clear cookies without domain (host-specific)
            foreach (var cookieName in cookieNames)
            {
                var isLanguageCookie = cookieName == "preferredLanguage";

                Response.Cookies.Append(
                    cookieName,
                    "", // Empty value
                    new CookieOptions
                    {
                        HttpOnly = !isLanguageCookie,
                        Secure = useSecure,
                        SameSite = isLanguageCookie ? SameSiteMode.Lax : sameSite,
                        Domain = null, // No domain = current host only
                        Path = "/",
                        Expires = expiredDate,
                        MaxAge = TimeSpan.Zero,
                    }
                );
            }

            // APPROACH 2: Clear cookies with exact request host
            var requestHost = Request.Host.Host;
            if (!string.IsNullOrEmpty(requestHost))
            {
                foreach (var cookieName in cookieNames)
                {
                    var isLanguageCookie = cookieName == "preferredLanguage";

                    Response.Cookies.Append(
                        cookieName,
                        "", // Empty value
                        new CookieOptions
                        {
                            HttpOnly = !isLanguageCookie,
                            Secure = useSecure,
                            SameSite = isLanguageCookie ? SameSiteMode.Lax : sameSite,
                            Domain = requestHost,
                            Path = "/",
                            Expires = expiredDate,
                            MaxAge = TimeSpan.Zero,
                        }
                    );
                }
            }

            // APPROACH 3: Manual Set-Cookie headers with multiple domain variations
            var expiry = "Thu, 01 Jan 1970 00:00:00 GMT";
            var manualDomains = new List<string>
            {
                "", // No domain
                opts.CookieDomain ?? "", // .asafarim.local
                requestHost, // identity.asafarim.local or api.asafarim.local
            };

            // Remove empty entries
            manualDomains = manualDomains.Where(d => !string.IsNullOrEmpty(d)).Distinct().ToList();

            foreach (var cookieName in cookieNames)
            {
                var isLanguageCookie = cookieName == "preferredLanguage";
                var httpOnlyPart = isLanguageCookie ? "" : "; HttpOnly";
                var securePart = useSecure ? "; Secure" : "";
                var sameSitePart = isLanguageCookie ? "; SameSite=Lax" : $"; SameSite={sameSite}";

                foreach (var domain in manualDomains)
                {
                    var domainPart = string.IsNullOrEmpty(domain) ? "" : $"; Domain={domain}";
                    var header =
                        $"{cookieName}=; Path=/; Expires={expiry}; Max-Age=0{httpOnlyPart}{securePart}{sameSitePart}{domainPart}";
                    Response.Headers.Append("Set-Cookie", header);

                    _logger.LogDebug("📤 Manual Set-Cookie: {Header}", header);
                }
            }

            // Add Clear-Site-Data header as backup
            Response.Headers.TryAdd("Clear-Site-Data", "\"cookies\"");

            _logger.LogInformation(
                "🍪 DEVELOPMENT additional cookie clearing complete with {Count} manual headers",
                Response.Headers.Where(h => h.Key == "Set-Cookie").SelectMany(h => h.Value).Count()
            );
        }
        else
        {
            // PRODUCTION: Try different SameSite combinations as backup
            var expiry = "Thu, 01 Jan 1970 00:00:00 GMT";
            var sameSiteValues = new[] { "Lax", "Strict", "None" };

            foreach (var cookieName in cookieNames)
            {
                var isLanguageCookie = cookieName == "preferredLanguage";
                var httpOnlyPart = isLanguageCookie ? "" : "; HttpOnly";
                var securePart = useSecure ? "; Secure" : "";

                foreach (var sameSiteValue in sameSiteValues)
                {
                    var sameSitePart = $"; SameSite={sameSiteValue}";
                    var header =
                        $"{cookieName}=; Path=/; Expires={expiry}; Max-Age=0{httpOnlyPart}{securePart}{sameSitePart}; Domain={opts.CookieDomain}";
                    Response.Headers.Append("Set-Cookie", header);
                }
            }

            // Also use Clear-Site-Data as backup
            Response.Headers.TryAdd("Clear-Site-Data", "\"cookies\"");
        }
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

    private AuthResponse CreateAuthResponse(
        AppUser user,
        IEnumerable<string> roles,
        string accessToken,
        string refreshToken
    )
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
                Roles = roles.ToArray(),
            },
        };
    }

    /// <summary>
    /// Validate password setup token (magic link)
    /// </summary>
    [HttpPost("validate-setup-token")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ValidateSetupToken([FromBody] ValidateSetupTokenRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Token))
            return BadRequest(new { message = "Token is required" });

        var (isValid, userId, email) = await _passwordSetupTokenService.ValidateTokenAsync(
            req.Token
        );

        if (!isValid)
            return BadRequest(new { message = "Invalid or expired token" });

        _logger.LogInformation("Password setup token validated for user: {Email}", email);

        return Ok(
            new
            {
                userId = userId.ToString(),
                email = email,
                message = "Token is valid. You can now set your password.",
            }
        );
    }

    /// <summary>
    /// Set password using magic link token
    /// </summary>
    [HttpPost("setup-password")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SetupPassword([FromBody] SetupPasswordRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Token))
            return BadRequest(new { message = "Token is required" });

        if (string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { message = "Password is required" });

        var (isValid, userId) = await _passwordSetupTokenService.ValidateAndConsumeTokenAsync(
            req.Token
        );

        if (!isValid)
            return BadRequest(new { message = "Invalid or expired token" });

        var user = await _userManager.FindByIdAsync(userId.ToString()!);
        if (user == null)
            return BadRequest(new { message = "User not found" });

        // Set or reset the password
        IdentityResult result;
        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            // User doesn't have a password yet, add one
            result = await _userManager.AddPasswordAsync(user, req.Password);
        }
        else
        {
            // User already has a password, reset it
            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            result = await _userManager.ResetPasswordAsync(user, resetToken, req.Password);
        }

        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }
            return ValidationProblem(ModelState);
        }

        _logger.LogInformation("Password set successfully for user: {Email}", user.Email);

        // Generate tokens
        var roleNames = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.CreateAccessToken(user, roleNames);
        var refreshToken = await _refreshTokenService.CreateRefreshTokenAsync(
            user.Id,
            GetIpAddress()
        );

        // Set cookies
        SetAuthCookies(accessToken, refreshToken.Token, persistent: true, user);

        return Ok(CreateAuthResponse(user, roleNames, accessToken, refreshToken.Token));
    }

    /// <summary>
    /// Request password reset (forgot password)
    /// </summary>
    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email))
            return BadRequest(new { message = "Email is required" });

        var user = await _userManager.FindByEmailAsync(req.Email);
        if (user == null)
        {
            // Don't reveal if user exists or not (security best practice)
            _logger.LogWarning("Password reset requested for non-existent user: {Email}", req.Email);
            return Ok(new { message = "If an account exists with this email, you will receive a password reset link" });
        }

        // Generate password setup token
        var token = await _passwordSetupTokenService.GenerateTokenAsync(user.Id);

        _logger.LogInformation("Generated password setup token for user {UserId}, expires in 1440 minutes", user.Id);

        // Get the base URL from configuration
        var opts = _authOptions.Value;
        var baseUrl = opts.PasswordSetup?.BaseUrl ?? "http://localhost:5177";
        var resetLink = $"{baseUrl}/setup-password?token={token}";

        // Send email with reset link
        try
        {
            await _emailService.SendPasswordSetupEmailAsync(user.Email!, resetLink);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email to {Email}", user.Email);
            // Don't expose error details to client - still return success message for security
        }

        return Ok(new { message = "If an account exists with this email, you will receive a password reset link" });
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

public class ValidateSetupTokenRequest
{
    public string Token { get; set; } = default!;
}

public class SetupPasswordRequest
{
    public string Token { get; set; } = default!;
    public string Password { get; set; } = default!;
}

public class ForgotPasswordRequest
{
    public string Email { get; set; } = default!;
}

#endregion
