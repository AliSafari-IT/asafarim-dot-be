using System.Text;
using KidCode.Api.Data;
using KidCode.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Database
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Host=localhost;Port=5432;Database=kidcode;Username=postgres;Password=postgres";

builder.Services.AddDbContext<KidCodeDbContext>(options => options.UseNpgsql(connectionString));

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("AuthJwt");
var key = jwtSettings["Key"] ?? "dev-secret-key-please-change-32-bytes-min";
var issuer = jwtSettings["Issuer"] ?? "asafarim.local";
var audience = jwtSettings["Audience"] ?? "asafarim.local";

builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            ClockSkew = TimeSpan.FromSeconds(30),
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.TryGetValue("atk", out var token))
                    context.Token = token;
                return Task.CompletedTask;
            },
        };
    });

builder.Services.AddAuthorization();

// Services
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IProgressService, ProgressService>();
builder.Services.AddScoped<IChallengeService, ChallengeService>();

// CORS
var allowedOrigins = new[]
{
    "http://localhost:5190",
    "http://localhost:5191",
    "http://kidcode.asafarim.local:5190",
    "http://kidcode.asafarim.local:5191",
    "https://kidcode.asafarim.be",
};

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "frontend",
        policy =>
            policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials()
    );
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Migrate database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<KidCodeDbContext>();
    await db.Database.MigrateAsync();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { Status = "Healthy", Service = "KidCode API" }));

app.Run();
