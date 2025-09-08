using System.Text;
using Core.Api;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql.EntityFrameworkCore.PostgreSQL;

var builder = WebApplication.CreateBuilder(args);

// CORS for your web app (add more origins later)
string[] allowedOrigins =
{
    // HTTP origins
    "http://web.asafarim.local:5175",
    "http://ai.asafarim.local:5173",
    "http://identity.asafarim.local:5177",
    "http://core.asafarim.local:5174",
    "http://localhost:5174",
    // HTTPS origins
    "https://web.asafarim.local:5175",
    "https://ai.asafarim.local:5173",
    "https://identity.asafarim.local:5177",
    "https://core.asafarim.local:5174",
    "https://asafarim.be",
    "https://web.asafarim.be",
    "https://ai.asafarim.be",
    "https://core.asafarim.be",
    "https://identity.asafarim.be"
};

builder.Services.AddCors(opts =>
{
    opts.AddPolicy(
        "frontend",
        p => p.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials()
    );
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add database context using Jobs connection string for job tracking
var jobsConnectionString = builder.Configuration.GetConnectionString("JobsConnection");
if (!string.IsNullOrEmpty(jobsConnectionString))
{
    builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(jobsConnectionString));
}
else
{
    // Log warning that database is not configured
    builder.Services.AddLogging(logging =>
    {
        logging.AddConsole();
        logging.AddDebug();
    });
    Console.WriteLine("WARNING: Database connection string not found. Running without database.");
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

// Kestrel configuration is now handled through environment variables in the service file

var app = builder.Build();

app.UseCors("frontend");
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
