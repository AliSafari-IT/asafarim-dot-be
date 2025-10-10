using System.Security.Claims;
using System.Text;
using Identity.Api;
using Identity.Api.Extensions;
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

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder
    .Services.AddIdentityCore<AppUser>(o =>
    {
        o.User.RequireUniqueEmail = true;

        // Set password requirements
        o.Password.RequireDigit = true;
        o.Password.RequireLowercase = true;
        o.Password.RequireUppercase = true;
        o.Password.RequireNonAlphanumeric = true;
        o.Password.RequiredLength = 8;
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
        };
    });

builder.Services.AddAuthorization();

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
};

var developmentOrigins = new[]
{
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
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
                // In production, use specific origins
                p.WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()
                    .SetIsOriginAllowedToAllowWildcardSubdomains(); // Allow *.asafarim.be
            }
        }
    )
);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Use forwarded headers BEFORE any other middleware
app.UseForwardedHeaders();

app.UseCors("app");
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

// Run the app with automatic migrations
app.MigrateDatabase<AppDbContext>().Run();
