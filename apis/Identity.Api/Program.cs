using System.Text;
using Identity.Api;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Bind JWT options from either "AuthJwt" (preferred) or fallback to "Jwt" for compatibility
var authSection = builder.Configuration.GetSection("AuthJwt");
var jwtFallbackSection = builder.Configuration.GetSection("Jwt");
builder.Services.Configure<AuthOptions>(authSection.Exists() ? authSection : jwtFallbackSection);

var authOpts = new AuthOptions();
authSection.Bind(authOpts);
jwtFallbackSection.Bind(authOpts); // fallback will override only provided fields
// Ensure sensible defaults if configuration is missing or partial
// HMAC-SHA256 requires a sufficiently long symmetric key (>= 256 bits). Enforce a strong fallback.
const string FallbackJwtKey = "dev-secret-key-please-change-32-bytes-min-length-aaaa"; // 48+ chars
if (string.IsNullOrWhiteSpace(authOpts.Key) || authOpts.Key.Length < 32) authOpts.Key = FallbackJwtKey;
if (string.IsNullOrWhiteSpace(authOpts.Issuer)) authOpts.Issuer = "asafarim-identity";
if (string.IsNullOrWhiteSpace(authOpts.Audience)) authOpts.Audience = "asafarim-clients";
if (authOpts.AccessMinutes <= 0) authOpts.AccessMinutes = 60;
if (authOpts.RefreshDays <= 0) authOpts.RefreshDays = 7;
if (string.IsNullOrWhiteSpace(authOpts.CookieDomain)) authOpts.CookieDomain = ".asafarim.local";

// Also enforce defaults for injected options
builder.Services.PostConfigure<AuthOptions>(opts =>
{
    if (string.IsNullOrWhiteSpace(opts.Key) || opts.Key.Length < 32) opts.Key = FallbackJwtKey;
    if (string.IsNullOrWhiteSpace(opts.Issuer)) opts.Issuer = "asafarim-identity";
    if (string.IsNullOrWhiteSpace(opts.Audience)) opts.Audience = "asafarim-clients";
    if (opts.AccessMinutes <= 0) opts.AccessMinutes = 60;
    if (opts.RefreshDays <= 0) opts.RefreshDays = 7;
    if (string.IsNullOrWhiteSpace(opts.CookieDomain)) opts.CookieDomain = ".asafarim.local";
});

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder
    .Services.AddIdentityCore<AppUser>(o =>
    {
        o.User.RequireUniqueEmail = true;
    })
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddSignInManager();

builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = authOpts.Issuer,
            ValidAudience = authOpts.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(authOpts.Key)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                if (ctx.Request.Cookies.TryGetValue("atk", out var token))
                    ctx.Token = token;
                return Task.CompletedTask;
            },
        };
    });

builder.Services.AddAuthorization();

var allowedOrigins = new[]
{
    "http://web.asafarim.local:5173",
    "http://app.asafarim.local:5174",
    "http://ai.asafarim.local:5175",
    "http://jobs.asafarim.local:4200",
    "http://blog.asafarim.local:3000",
    "http://identity.asafarim.local:5177",
};

builder.Services.AddCors(opt =>
    opt.AddPolicy(
        "app",
        p => p.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials()
    )
);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors("app");
app.UseSwagger();
app.UseSwaggerUI();
app.UseAuthentication();
app.UseAuthorization();

static void SetAuthCookies(
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

app.MapPost(
    "/auth/register",
    async (
        RegisterRequest req,
        UserManager<AppUser> users,
        IOptions<AuthOptions> authOptions,
        HttpResponse res
    ) =>
    {
        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = req.Email,
            UserName = req.UserName ?? req.Email,
        };
        var result = await users.CreateAsync(user, req.Password);
        if (!result.Succeeded)
            return Results.ValidationProblem(
                result.Errors.ToDictionary(e => e.Code, e => new[] { e.Description })
            );

        // Generate tokens for the newly registered user
        var opts = authOptions.Value;
        if (string.IsNullOrWhiteSpace(opts.Key))
        {
            // Extra safety in case options are not bound or hot-reload left stale state
            opts.Key = "dev-secret-key-please-change";
        }
        var access = TokenService.CreateAccessToken(user, opts);
        var refresh = Guid.NewGuid().ToString("N");
        SetAuthCookies(res, access, refresh, opts);

        // Return user info along with tokens to match frontend expectations
        return Results.Ok(
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
);

app.MapPost(
    "/auth/login",
    async (
        LoginRequest req,
        UserManager<AppUser> users,
        SignInManager<AppUser> signIn,
        IOptions<AuthOptions> authOptions,
        HttpResponse res
    ) =>
    {
        var user = await users.FindByEmailAsync(req.Email);
        if (user is null)
            return Results.Unauthorized();

        var ok = await users.CheckPasswordAsync(user, req.Password);
        if (!ok)
            return Results.Unauthorized();

        var opts = authOptions.Value;
        var access = TokenService.CreateAccessToken(user, opts);
        var refresh = Guid.NewGuid().ToString("N"); // stub: store/rotate in DB for real usage
        SetAuthCookies(res, access, refresh, opts);

        // Return user info along with tokens to match frontend expectations
        return Results.Ok(
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
);

app.MapPost(
    "/auth/logout",
    (HttpResponse res) =>
    {
        res.Cookies.Delete("atk");
        res.Cookies.Delete("rtk");
        return Results.Ok();
    }
);

app.MapGet(
        "/auth/me",
        async (HttpContext ctx, UserManager<AppUser> users) =>
        {
            if (!ctx.User.Identity?.IsAuthenticated ?? true)
                return Results.Unauthorized();
            // Prefer NameIdentifier (mapped by default), fallback to raw "sub"
            var sub = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? ctx.User.FindFirst("sub")?.Value;
            if (string.IsNullOrWhiteSpace(sub))
                return Results.Unauthorized();
            var user = await users.FindByIdAsync(sub);
            return user is null
                ? Results.Unauthorized()
                : Results.Ok(new MeResponse(user.Id.ToString(), user.Email, user.UserName));
        }
    )
    .RequireAuthorization();
app.Run();
