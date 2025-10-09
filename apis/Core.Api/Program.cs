using System.Text;
using Core.Api;
using Core.Api.Data;
using Core.Api.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql.EntityFrameworkCore.PostgreSQL;

var builder = WebApplication.CreateBuilder(args);

// Configure structured logging
builder.Host.ConfigureStructuredLogging();

// CORS for your web app with production domains
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
    "https://*.asafarim.be", // Wildcard for all subdomains
};

var developmentOrigins = new[]
{
    "http://web.asafarim.local:5175",
    "http://ai.asafarim.local:5173",
    "http://identity.asafarim.local:5101",
    "http://identity.asafarim.local:5177",  // Identity Portal
    "http://core.asafarim.local:5174",
    "http://jobs.asafarim.local:4200",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5175",
    "http://localhost:5177",
    "http://localhost:5101",
    "http://localhost:5102",
    "http://localhost:4200",
};

// Combine origins based on environment
string[] allowedOrigins = builder.Environment.IsProduction()
    ? productionOrigins.Concat(corsOriginsEnv?.Split(',') ?? Array.Empty<string>()).ToArray()
    : developmentOrigins.Concat(productionOrigins).ToArray();

builder.Services.AddCors(opts =>
{
    opts.AddPolicy(
        "frontend",
        p =>
            p.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .SetIsOriginAllowedToAllowWildcardSubdomains() // Allow wildcard subdomains
    );
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddMemoryCache();

// Add database contexts
var defaultConnection = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrEmpty(defaultConnection))
{
    builder.Services.AddDbContext<CoreDbContext>(options =>
        options.UseNpgsql(
            defaultConnection,
            npgsqlOptions =>
                npgsqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)
        )
    );
}

var jobsConnectionString = builder.Configuration.GetConnectionString("JobsConnection");
if (!string.IsNullOrEmpty(jobsConnectionString))
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(
            jobsConnectionString,
            npgsqlOptions =>
                npgsqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)
        )
    );
}

if (string.IsNullOrEmpty(defaultConnection) && string.IsNullOrEmpty(jobsConnectionString))
{
    // Log warning that database is not configured
    builder.Services.AddLogging(logging =>
    {
        logging.AddConsole();
        logging.AddDebug();
    });
    Console.WriteLine("WARNING: Database connection strings not found. Running without database.");
}

// Authentication (share cookie "atk" from Identity)
builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var issuer = builder.Configuration["AuthJwt:Issuer"] ?? "asafarim-identity";
        var audience = builder.Configuration["AuthJwt:Audience"] ?? "asafarim-clients";
        var key =
            builder.Configuration["AuthJwt:Key"]
            ?? "dev-secret-key-please-change-32-bytes-min-length-aaaa";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
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

// Configure Kestrel to listen on core-api.asafarim.local:5102
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5102); // Listen on all IP addresses on port 5102
});

var app = builder.Build();

// IMPORTANT: UseCors must be called before UseAuthentication and UseAuthorization
app.UseCors("frontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Proxy auth endpoints to Identity API
var identityApiUrl = builder.Configuration["IdentityApiUrl"] ?? "http://localhost:5101";
var httpClient = new HttpClient { BaseAddress = new Uri(identityApiUrl) };

app.MapGet(
    "/auth/me",
    async (HttpContext context) =>
    {
        var token = context.Request.Cookies["atk"];
        if (string.IsNullOrEmpty(token))
            return Results.Unauthorized();

        var request = new HttpRequestMessage(HttpMethod.Get, "/auth/me");
        request.Headers.Add("Authorization", $"Bearer {token}");

        // Forward cookies
        if (context.Request.Headers.TryGetValue("Cookie", out var cookies))
            request.Headers.Add("Cookie", cookies.ToString());

        var response = await httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
            return Results.Unauthorized();

        var content = await response.Content.ReadAsStringAsync();
        return Results.Content(content, "application/json");
    }
);

app.MapGet(
    "/auth/token",
    async (HttpContext context) =>
    {
        var token = context.Request.Cookies["atk"];
        if (string.IsNullOrEmpty(token))
            return Results.Unauthorized();

        return Results.Ok(new { token });
    }
);

app.MapPost(
    "/auth/logout",
    async (HttpContext context) =>
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/auth/logout");

        // Forward cookies
        if (context.Request.Headers.TryGetValue("Cookie", out var cookies))
            request.Headers.Add("Cookie", cookies.ToString());

        var response = await httpClient.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();

        // Clear cookies on this domain too
        context.Response.Cookies.Delete("atk");
        context.Response.Cookies.Delete("rtk");

        return Results.Ok(content);
    }
);

app.MapPost(
    "/auth/refresh",
    async (HttpContext context) =>
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/auth/refresh");

        // Forward cookies
        if (context.Request.Headers.TryGetValue("Cookie", out var cookies))
            request.Headers.Add("Cookie", cookies.ToString());

        var response = await httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
            return Results.Unauthorized();

        var content = await response.Content.ReadAsStringAsync();

        // Forward Set-Cookie headers
        if (response.Headers.TryGetValues("Set-Cookie", out var setCookies))
        {
            foreach (var cookie in setCookies)
                context.Response.Headers.Append("Set-Cookie", cookie);
        }

        return Results.Content(content, "application/json");
    }
);

// Add health endpoint
app.MapGet(
    "/health",
    () =>
        Results.Ok(
            new
            {
                Status = "Healthy",
                Service = "Core API",
                Version = "1.0.0",
                Environment = app.Environment.EnvironmentName,
                Timestamp = DateTime.UtcNow,
            }
        )
);

// Run the app with automatic migrations
if (builder.Configuration.GetConnectionString("DefaultConnection") != null)
{
    app.MigrateDatabase<CoreDbContext>().Run();
}
if (builder.Configuration.GetConnectionString("JobsConnection") != null)
{
    app.MigrateDatabase<AppDbContext>().Run();
}
else
{
    app.Run();
}
