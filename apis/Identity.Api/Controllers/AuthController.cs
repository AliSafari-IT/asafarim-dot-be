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
        if (!User.Identity?.IsAuthenticated ?? true)
            return Unauthorized();
        // Prefer NameIdentifier (mapped by default), fallback to raw "sub"
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(sub))
            return Unauthorized();
        var user = await _userManager.FindByIdAsync(sub);
        if (user is null)
            return Unauthorized();
        var roleNames = await _userManager.GetRolesAsync(user);
        return Ok(
            new MeResponse(user.Id.ToString(), user.Email, user.UserName, roleNames.ToArray())
        );
    }

    [HttpGet("token")]
    public IActionResult GetToken()
    {
        // Get the token from the Authorization header
        string authHeader = HttpContext.Request.Headers["Authorization"];
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
        {
            return Unauthorized();
        }

        string token = authHeader.Substring("Bearer ".Length).Trim();
        return Ok(new { token });
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

        var accessCookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = useSecure,
            SameSite = sameSite,
            Domain = opts.CookieDomain,
            Path = "/",
        };
        if (persistent)
        {
            accessCookieOptions.Expires = DateTime.UtcNow.AddMinutes(opts.AccessMinutes);
        }
        response.Cookies.Append("atk", accessToken, accessCookieOptions);

        var refreshCookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = useSecure,
            SameSite = sameSite,
            Domain = opts.CookieDomain,
            Path = "/",
        };
        if (persistent)
        {
            refreshCookieOptions.Expires = DateTime.UtcNow.AddDays(opts.RefreshDays);
        }
        response.Cookies.Append("rtk", refreshToken, refreshCookieOptions);
    }
}
