using System.Security.Claims;
using Identity.Api;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Identity.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly IOptions<AuthOptions> _authOptions;

    public AuthController(
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        IOptions<AuthOptions> authOptions
    )
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _authOptions = authOptions;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest req)
    {
        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = req.Email,
            UserName = req.UserName ?? req.Email,
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

        // Generate tokens for the newly registered user
        var opts = _authOptions.Value;
        if (string.IsNullOrWhiteSpace(opts.Key))
        {
            // Extra safety in case options are not bound or hot-reload left stale state
            opts.Key = "dev-secret-key-please-change";
        }
        var roleNames = await _userManager.GetRolesAsync(user);
        var access = TokenService.CreateAccessToken(user, roleNames.ToArray(), opts);
        var refresh = Guid.NewGuid().ToString("N");
        // Registration flow: default to persistent cookies
        SetAuthCookies(Response, access, refresh, opts, persistent: true);

        // Return user info along with tokens to match frontend expectations
        return Ok(
            new
            {
                token = access,
                refreshToken = refresh,
                expiresAt = DateTime.UtcNow.AddMinutes(opts.AccessMinutes).ToString("o"),
                user = new
                {
                    id = user.Id.ToString(),
                    email = user.Email,
                    firstName = req.UserName ?? req.Email,
                    lastName = "",
                    roles = roleNames.ToArray(),
                },
            }
        );
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var user = await _userManager.FindByEmailAsync(req.Email);
        if (user is null)
            return Unauthorized();

        // Check if the user has a null password (needs to set one)
        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            return Ok(
                new
                {
                    requiresPasswordSetup = true,
                    userId = user.Id.ToString(),
                    email = user.Email,
                }
            );
        }

        var ok = await _userManager.CheckPasswordAsync(user, req.Password);
        if (!ok)
            return Unauthorized();

        var opts = _authOptions.Value;
        var roleNamesLogin = await _userManager.GetRolesAsync(user);
        var access = TokenService.CreateAccessToken(user, roleNamesLogin.ToArray(), opts);
        var refresh = Guid.NewGuid().ToString("N"); // stub: store/rotate in DB for real usage
        // Use RememberMe to decide persistence
        SetAuthCookies(Response, access, refresh, opts, persistent: req.RememberMe);

        // Return user info along with tokens to match frontend expectations
        return Ok(
            new
            {
                token = access,
                refreshToken = refresh,
                expiresAt = DateTime.UtcNow.AddMinutes(opts.AccessMinutes).ToString("o"),
                user = new
                {
                    id = user.Id.ToString(),
                    email = user.Email,
                    firstName = user.UserName,
                    lastName = "",
                    roles = roleNamesLogin.ToArray(),
                },
            }
        );
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        var opts = _authOptions.Value;
        // Compute cookie security options the same way as in SetAuthCookies
        var isProdDomain =
            opts.CookieDomain?.EndsWith(".asafarim.be", StringComparison.OrdinalIgnoreCase) == true;
        var context = Response.HttpContext;
        var isHttps = context?.Request?.IsHttps == true;
        var useSecure = isProdDomain || isHttps;
        var sameSite = useSecure ? SameSiteMode.None : SameSiteMode.Lax;

        // Delete cookies with the same options used when creating them
        Response.Cookies.Delete(
            "atk",
            new CookieOptions
            {
                HttpOnly = true,
                Secure = useSecure,
                SameSite = sameSite,
                Domain = opts.CookieDomain,
                Path = "/",
            }
        );

        Response.Cookies.Delete(
            "rtk",
            new CookieOptions
            {
                HttpOnly = true,
                Secure = useSecure,
                SameSite = sameSite,
                Domain = opts.CookieDomain,
                Path = "/",
            }
        );

        return Ok(new { message = "Logged out successfully" });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        // Debug logging
        var hasCookie = Request.Cookies.TryGetValue("atk", out var cookieValue);
        Console.WriteLine($"[GetCurrentUser] Has atk cookie: {hasCookie}");
        Console.WriteLine($"[GetCurrentUser] Cookie value length: {cookieValue?.Length ?? 0}");
        Console.WriteLine($"[GetCurrentUser] User.Identity.IsAuthenticated: {User.Identity?.IsAuthenticated}");
        Console.WriteLine($"[GetCurrentUser] User.Identity.Name: {User.Identity?.Name}");
        
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            Console.WriteLine($"[GetCurrentUser] Returning Unauthorized - not authenticated");
            return Unauthorized();
        }
        // Prefer NameIdentifier (mapped by default), fallback to raw "sub"
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        Console.WriteLine($"[GetCurrentUser] Subject claim: {sub}");
        if (string.IsNullOrWhiteSpace(sub))
        {
            Console.WriteLine($"[GetCurrentUser] Returning Unauthorized - no subject claim");
            return Unauthorized();
        }
        var user = await _userManager.FindByIdAsync(sub);
        if (user is null)
        {
            Console.WriteLine($"[GetCurrentUser] Returning Unauthorized - user not found");
            return Unauthorized();
        }
        var roleNames = await _userManager.GetRolesAsync(user);
        Console.WriteLine($"[GetCurrentUser] Success - returning user {user.Email}");
        return Ok(
            new MeResponse(user.Id.ToString(), user.Email, user.UserName, roleNames.ToArray())
        );
    }

    [HttpGet("token")]
    public IActionResult GetToken()
    {
        // Prefer the HttpOnly cookie set by the server
        if (Request.Cookies.TryGetValue("atk", out var cookieToken) && !string.IsNullOrWhiteSpace(cookieToken))
        {
            return Ok(new { token = cookieToken });
        }

        // Fallback: allow Authorization header if provided and not empty/null
        var authHeader = HttpContext.Request.Headers["Authorization"].ToString();
        if (!string.IsNullOrWhiteSpace(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            var headerToken = authHeader.Substring("Bearer ".Length).Trim();
            if (!string.IsNullOrWhiteSpace(headerToken) && !string.Equals(headerToken, "null", StringComparison.OrdinalIgnoreCase))
            {
                return Ok(new { token = headerToken });
            }
        }

        return Unauthorized();
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken()
    {
        // Get the refresh token from cookies
        if (!Request.Cookies.TryGetValue("rtk", out var refreshToken) || string.IsNullOrWhiteSpace(refreshToken))
        {
            return Unauthorized(new { message = "No refresh token provided" });
        }

        // TODO: In a real implementation, you would validate the refresh token against a database
        // For now, we'll just validate that it's not empty and generate a new access token
        // In production, you should:
        // 1. Store refresh tokens in the database with expiration
        // 2. Validate the refresh token exists and hasn't expired
        // 3. Generate a new refresh token and update it in the database
        // 4. Return both new access and refresh tokens

        // For this demo, we'll just check if the user is authenticated via cookies
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Unauthorized(new { message = "Invalid refresh token" });
        }

        // Get user info from the current claims
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(sub))
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(sub);
        if (user is null)
            return Unauthorized();

        var opts = _authOptions.Value;
        var roleNames = await _userManager.GetRolesAsync(user);
        var access = TokenService.CreateAccessToken(user, roleNames.ToArray(), opts);

        // Generate new refresh token (in production, you'd store and validate this)
        var newRefresh = Guid.NewGuid().ToString("N");

        // Set new cookies with updated tokens
        SetAuthCookies(Response, access, newRefresh, opts, persistent: true);

        return Ok(new
        {
            token = access,
            refreshToken = newRefresh,
            expiresAt = DateTime.UtcNow.AddMinutes(opts.AccessMinutes).ToString("o"),
            user = new
            {
                id = user.Id.ToString(),
                email = user.Email,
                firstName = user.UserName,
                lastName = "",
                roles = roleNames.ToArray(),
            },
        });
    }

    [HttpPost("setup-password")]
    public async Task<IActionResult> SetupPassword([FromBody] SetupPasswordRequest req)
    {
        // Declare user variable outside try block for scope
        AppUser user;

        try
        {
            // Validate the request
            if (string.IsNullOrEmpty(req.UserId) || string.IsNullOrEmpty(req.Password))
            {
                return BadRequest(new { message = "User ID and password are required" });
            }

            // Find the user
            user = await _userManager.FindByIdAsync(req.UserId);
            if (user is null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Check if user actually has a null password
            if (!string.IsNullOrEmpty(user.PasswordHash))
            {
                return BadRequest(new { message = "User already has a password set" });
            }

            // Set the password - use AddPassword for users with null password hash
            var result = await _userManager.AddPasswordAsync(user, req.Password);

            if (!result.Succeeded)
            {
                // Return validation errors in a structured format
                var errors = result
                    .Errors.Select(e => new { code = e.Code, description = e.Description })
                    .ToList();
                return BadRequest(new { message = "Password validation failed", errors });
            }
        }
        catch (Exception ex)
        {
            // Log the exception
            Console.Error.WriteLine($"Error in SetupPassword: {ex.Message}");
            return StatusCode(
                500,
                new { message = "An error occurred while setting the password", error = ex.Message }
            );
        }

        // Log the user in
        var opts = _authOptions.Value;
        var roleNames = await _userManager.GetRolesAsync(user);
        var access = TokenService.CreateAccessToken(user, roleNames.ToArray(), opts);
        var refresh = Guid.NewGuid().ToString("N");
        // After setting password, default to persistent cookies
        SetAuthCookies(Response, access, refresh, opts, persistent: true);

        // Return user info along with tokens
        return Ok(
            new
            {
                token = access,
                refreshToken = refresh,
                expiresAt = DateTime.UtcNow.AddMinutes(opts.AccessMinutes).ToString("o"),
                user = new
                {
                    id = user.Id.ToString(),
                    email = user.Email,
                    firstName = user.UserName,
                    lastName = "",
                    roles = roleNames.ToArray(),
                },
            }
        );
    }

    private void SetAuthCookies(
        HttpResponse response,
        string accessToken,
        string refreshToken,
        AuthOptions opts,
        bool persistent
    )
    {
        var isProdDomain =
            opts.CookieDomain?.EndsWith(".asafarim.be", StringComparison.OrdinalIgnoreCase) == true;
        var context = response.HttpContext;
        var isHttps = context?.Request?.IsHttps == true;
        var useSecure = isProdDomain || isHttps;

        // For production with HTTPS, use None with Secure flag
        // For local development, use Lax to ensure cookies work across subdomains
        var sameSite = isProdDomain && isHttps ? SameSiteMode.None : SameSiteMode.Lax;
        
        // Debug logging
        Console.WriteLine($"[SetAuthCookies] CookieDomain: {opts.CookieDomain}");
        Console.WriteLine($"[SetAuthCookies] isProdDomain: {isProdDomain}");
        Console.WriteLine($"[SetAuthCookies] isHttps: {isHttps}");
        Console.WriteLine($"[SetAuthCookies] useSecure: {useSecure}");
        Console.WriteLine($"[SetAuthCookies] sameSite: {sameSite}");
        Console.WriteLine($"[SetAuthCookies] persistent: {persistent}");

        var accessExpiration = DateTime.UtcNow.AddMinutes(opts.AccessMinutes);
        var refreshExpiration = persistent 
            ? DateTime.UtcNow.AddDays(opts.RefreshDays)
            : DateTime.UtcNow.AddHours(8);
        
        var accessCookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = useSecure,
            SameSite = sameSite,
            Domain = opts.CookieDomain,
            Path = "/",
            // CRITICAL: SameSite=None cookies MUST have Expires set
            Expires = accessExpiration,
            MaxAge = TimeSpan.FromMinutes(opts.AccessMinutes)
        };
        
        Console.WriteLine($"[SetAuthCookies] Access cookie Expires: {accessExpiration}");
        Console.WriteLine($"[SetAuthCookies] Access cookie MaxAge: {opts.AccessMinutes} minutes");
        response.Cookies.Append("atk", accessToken, accessCookieOptions);

        var refreshCookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = useSecure,
            SameSite = sameSite,
            Domain = opts.CookieDomain,
            Path = "/",
            // CRITICAL: SameSite=None cookies MUST have Expires set
            Expires = refreshExpiration,
            MaxAge = persistent ? TimeSpan.FromDays(opts.RefreshDays) : TimeSpan.FromHours(8)
        };
        
        Console.WriteLine($"[SetAuthCookies] Refresh cookie Expires: {refreshExpiration}");
        response.Cookies.Append("rtk", refreshToken, refreshCookieOptions);
    }
}
