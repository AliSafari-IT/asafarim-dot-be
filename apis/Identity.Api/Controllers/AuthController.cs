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
        SetAuthCookies(Response, access, refresh, opts);

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
                    roles = new string[] { "user" },
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

        var ok = await _userManager.CheckPasswordAsync(user, req.Password);
        if (!ok)
            return Unauthorized();

        var opts = _authOptions.Value;
        var roleNamesLogin = await _userManager.GetRolesAsync(user);
        var access = TokenService.CreateAccessToken(user, roleNamesLogin.ToArray(), opts);
        var refresh = Guid.NewGuid().ToString("N"); // stub: store/rotate in DB for real usage
        SetAuthCookies(Response, access, refresh, opts);

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
                    roles = new string[] { "user" },
                },
            }
        );
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        var opts = _authOptions.Value;

        // Delete cookies with the same options used when creating them
        Response.Cookies.Delete(
            "atk",
            new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Domain = opts.CookieDomain,
                Path = "/",
            }
        );

        Response.Cookies.Delete(
            "rtk",
            new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
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

    private static void SetAuthCookies(
        HttpResponse res,
        string accessToken,
        string refreshToken,
        AuthOptions opts
    )
    {
        res.Cookies.Append(
            "atk",
            accessToken,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = false, // dev (same-site subdomains). set true + SameSite=None in prod
                SameSite = SameSiteMode.Lax,
                Domain = opts.CookieDomain,
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddMinutes(opts.AccessMinutes),
            }
        );
        res.Cookies.Append(
            "rtk",
            refreshToken,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Domain = opts.CookieDomain,
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddDays(opts.RefreshDays),
            }
        );
    }
}
