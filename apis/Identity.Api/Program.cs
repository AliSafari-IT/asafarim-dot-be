using System.Security.Claims;
using System.Text;
using Identity.Api;
using Identity.Api.Extensions;
using Identity.Api.Middleware;
using Identity.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Configure forwarded headers for reverse proxy
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// Configure structured logging
builder.Host.ConfigureStructuredLogging();

// Add controllers
builder.Services.AddControllers();

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
if (string.IsNullOrWhiteSpace(authOpts.Key) || authOpts.Key.Length < 32)
    authOpts.Key = FallbackJwtKey;
if (string.IsNullOrWhiteSpace(authOpts.Issuer))
    authOpts.Issuer = "asafarim-identity";
if (string.IsNullOrWhiteSpace(authOpts.Audience))
    authOpts.Audience = "asafarim-clients";
if (authOpts.AccessMinutes <= 0)
    authOpts.AccessMinutes = 60;
if (authOpts.RefreshDays <= 0)
    authOpts.RefreshDays = 7;
if (string.IsNullOrWhiteSpace(authOpts.CookieDomain))
    authOpts.CookieDomain = ".asafarim.local";

// Also enforce defaults for injected options
builder.Services.PostConfigure<AuthOptions>(opts =>
{
    if (string.IsNullOrWhiteSpace(opts.Key) || opts.Key.Length < 32)
        opts.Key = FallbackJwtKey;
    if (string.IsNullOrWhiteSpace(opts.Issuer))
        opts.Issuer = "asafarim-identity";
    if (string.IsNullOrWhiteSpace(opts.Audience))
        opts.Audience = "asafarim-clients";
    if (opts.AccessMinutes <= 0)
        opts.AccessMinutes = 60;
    if (opts.RefreshDays <= 0)
        opts.RefreshDays = 7;
    if (string.IsNullOrWhiteSpace(opts.CookieDomain))
        opts.CookieDomain = ".asafarim.local";
});

// Configure database with connection pooling and retry logic
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions =>
        {
            npgsqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(5),
                errorCodesToAdd: null
            );
            npgsqlOptions.CommandTimeout(30);
        }
    );

    if (builder.Environment.IsDevelopment())
    {
        opt.EnableSensitiveDataLogging();
        opt.EnableDetailedErrors();
    }
});

// Configure Identity with enhanced security settings
builder
    .Services.AddIdentityCore<AppUser>(o =>
    {
        // User settings
        o.User.RequireUniqueEmail = true;

        // Password requirements
        o.Password.RequireDigit = true;
        o.Password.RequireLowercase = true;
        o.Password.RequireUppercase = true;
        o.Password.RequireNonAlphanumeric = true;
        o.Password.RequiredLength = 8;
        o.Password.RequiredUniqueChars = 4;

        // Lockout settings
        o.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
        o.Lockout.MaxFailedAccessAttempts = 5;
        o.Lockout.AllowedForNewUsers = true;

        // Sign-in settings
        o.SignIn.RequireConfirmedEmail = false; // Set to true in production with email service
        o.SignIn.RequireConfirmedAccount = false;
    })
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();

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
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = ClaimTypes.NameIdentifier,
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                if (ctx.Request.Cookies.TryGetValue("atk", out var token))
                    ctx.Token = token;
                return Task.CompletedTask;
            },
            OnTokenValidated = async ctx =>
            {
                // After JWT is validated, check if refresh token has been revoked
                // This ensures that even if the access token is still valid,
                // a revoked refresh token means the user is logged out
                if (
                    ctx.Request.Cookies.TryGetValue("rtk", out var refreshToken)
                    && !string.IsNullOrEmpty(refreshToken)
                )
                {
                    var refreshTokenService =
                        ctx.HttpContext.RequestServices.GetRequiredService<IRefreshTokenService>();
                    var isValid = await refreshTokenService.ValidateRefreshTokenAsync(refreshToken);

                    if (!isValid)
                    {
                        // Refresh token is revoked/invalid, reject the request
                        ctx.Fail("Refresh token has been revoked");
                    }
                }
            },
        };
    });

// Register application services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();
builder.Services.AddScoped<IPasswordSetupTokenService, PasswordSetupTokenService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddHttpClient<ISmartOpsRoleService, SmartOpsRoleService>();

// Configure authorization policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("UserOrAdmin", policy => policy.RequireRole("User", "Admin"));
});

// Get allowed origins from environment or use defaults
var corsOriginsEnv = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS");
var productionOrigins = new[]
{
    "https://asafarim.be",
    "https://www.asafarim.be",
    "https://ai.asafarim.be",
    "https://core.asafarim.be",
    "https://blog.asafarim.be",
    "https://identity.asafarim.be",
    "https://web.asafarim.be",
    "https://taskmanagement.asafarim.be",
    "https://smartops.asafarim.be",
    "https://testora.asafarim.be",
    "https://freelance-toolkit.asafarim.be"
};

var developmentOrigins = new[]
{
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5178",
    "http://localhost:4200",
    "http://localhost:5101",
    "http://asafarim.local",
    "http://ai.asafarim.local:5173",
    "http://ai.asafarim.local",
    "http://core.asafarim.local",
    "http://jobs.asafarim.local",
    "http://blog.asafarim.local",
    "http://identity.asafarim.local",
    "http://identity.asafarim.local:5101",
    "http://web.asafarim.local:5175",
    "http://web.asafarim.local",
    "http://core.asafarim.local:5174",
    "http://jobs.asafarim.local:4200",
    "http://blog.asafarim.local:3000",
    "http://web.asafarim.local:5175",
    "http://taskmanagement.asafarim.local:5176",
    "http://smartops.asafarim.local:5178",
    "http://testora.asafarim.local:5180",
    "http://freelance-toolkit.asafarim.local:5185"
};

// Combine origins based on environment
var allowedOrigins = builder.Environment.IsProduction()
    ? productionOrigins.Concat(corsOriginsEnv?.Split(',') ?? Array.Empty<string>()).ToArray()
    : developmentOrigins.Concat(productionOrigins).ToArray();

Console.WriteLine($"[CORS] Environment: {builder.Environment.EnvironmentName}");
Console.WriteLine($"[CORS] Allowed origins: {string.Join(", ", allowedOrigins)}");

builder.Services.AddCors(opt =>
    opt.AddPolicy(
        "app",
        p =>
        {
            if (builder.Environment.IsDevelopment())
            {
                // In development, allow any origin
                p.SetIsOriginAllowed(_ => true)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            }
            else
            {
                // In production, use specific origins with proper CORS settings for cookies
                p.WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()
                    .SetPreflightMaxAge(TimeSpan.FromHours(24)); // Reduce preflight requests

                // Log the allowed origins for debugging
                Console.WriteLine(
                    $"[CORS] Allowed origins for credentials: {string.Join(", ", allowedOrigins)}"
                );

                // Additional logging for CORS policy
                foreach (var origin in allowedOrigins)
                {
                    Console.WriteLine($"[CORS] Registered origin: {origin}");
                }
            }
        }
    )
);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Use forwarded headers BEFORE any other middleware
app.UseForwardedHeaders();

// Apply rate limiting to auth endpoints
app.UseRateLimiting();

// CORS must be before HTTPS redirection
app.UseCors("app");
app.UseHttpsRedirection();
app.UseSwagger();
app.UseSwaggerUI();
app.UseAuthentication();
app.UseAuthorization();

// Map controllers
app.MapControllers();

// Add health endpoint
app.MapGet(
    "/health",
    () =>
        Results.Ok(
            new
            {
                Status = "Healthy",
                Service = "Identity API",
                Version = "1.0.0",
                Environment = app.Environment.EnvironmentName,
                Timestamp = DateTime.UtcNow,
            }
        )
);

// Add a dedicated endpoint for clearing cookies with Clear-Site-Data header
app.MapGet(
    "/clear-cookies",
    (HttpContext httpContext) =>
    {
        // Add Clear-Site-Data header directly to the HttpContext
        httpContext.Response.Headers.Append("Clear-Site-Data", "\"cookies\"");
        Console.WriteLine("[clear-cookies] Sent Clear-Site-Data header");
        return Results.Ok(new { cleared = true });
    }
);

// Run the app with automatic migrations
app.MigrateDatabase<AppDbContext>().Run();
