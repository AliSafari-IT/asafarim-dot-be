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
    "http://web.asafarim.local:5175",
    "http://ai.asafarim.local:5173",
    "http://identity.asafarim.local:5177",
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


// Add database context if connection string is available
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrEmpty(connectionString))
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(connectionString));
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

// Configure Kestrel to listen on core-api.asafarim.local:5102
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5102); // Listen on all IP addresses on port 5102
});

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
