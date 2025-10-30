using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SmartOps.Api.Data;
using SmartOps.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// CORS configuration
var developmentOrigins = new[]
{
    "http://smartops.asafarim.local:5178",
    "http://localhost:5178",
    "http://localhost:3000",
    "http://localhost:5173",
};

var productionOrigins = new[] { 
    "https://smartops.asafarim.be" ,
    "https://www.asafarim.be",
    "https://ai.asafarim.be",
    "https://core.asafarim.be",
    "https://blog.asafarim.be",
    "https://identity.asafarim.be",
    "https://web.asafarim.be",
    "https://taskmanagement.asafarim.be",
};

string[] allowedOrigins = builder.Environment.IsProduction()
    ? productionOrigins
    : developmentOrigins.Concat(productionOrigins).ToArray();

builder.Services.AddCors(opts =>
{
    opts.AddPolicy(
        "frontend",
        p => p.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials()
    );
});

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SmartOps API", Version = "v1" });
    c.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "JWT Authorization header using the Bearer scheme.",
        }
    );
    c.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer",
                    },
                },
                new string[] { }
            },
        }
    );
});

// Add database context - PostgreSQL
var smartOpsConnection =
    builder.Configuration.GetConnectionString("SmartOpsConnection")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

if (!string.IsNullOrEmpty(smartOpsConnection))
{
    builder.Services.AddDbContext<SmartOpsDbContext>(options =>
        options.UseNpgsql(
            smartOpsConnection,
            npgsqlOptions =>
            {
                npgsqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
                npgsqlOptions.MigrationsAssembly("SmartOps.Api");
            }
        )
    );
}

// Add application services
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<IDeviceService, DeviceService>();
builder.Services.AddScoped<IReadingService, ReadingService>();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("AuthJwt");
var issuer = jwtSettings["Issuer"];
var audience = jwtSettings["Audience"];
var key = jwtSettings["Key"];

Console.WriteLine(
    $"DEBUG: JWT Configuration - Issuer: {issuer}, Audience: {audience}, Key length: {key?.Length ?? 0}"
);

// Only set up authentication if we have valid JWT config
if (!string.IsNullOrEmpty(key) && !string.IsNullOrEmpty(issuer) && !string.IsNullOrEmpty(audience))
{
    Console.WriteLine("DEBUG: Setting up JWT authentication");
    builder
        .Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
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
            };

            // Extract token from cookie if present
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    if (context.Request.Cookies.TryGetValue("atk", out var token))
                    {
                        context.Token = token;
                    }
                    return Task.CompletedTask;
                },
                OnAuthenticationFailed = context =>
                {
                    Console.WriteLine($"DEBUG: Authentication failed: {context.Exception.Message}");
                    return Task.CompletedTask;
                },
                OnTokenValidated = context =>
                {
                    Console.WriteLine(
                        $"DEBUG: Token validated successfully for user: {context.Principal?.FindFirst("sub")?.Value ?? "unknown"}"
                    );
                    return Task.CompletedTask;
                },
            };
        });
}
else
{
    Console.WriteLine("WARNING: JWT configuration incomplete - authentication disabled");
}

var app = builder.Build();

// Run migrations on startup
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<SmartOpsDbContext>();

    var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync();
    var appliedMigrations = await dbContext.Database.GetAppliedMigrationsAsync();
    
    Console.WriteLine($"DEBUG: Applied migrations count: {appliedMigrations.Count()}");
    foreach (var migration in appliedMigrations)
    {
        Console.WriteLine($"DEBUG: Applied migration: {migration}");
    }
    
    Console.WriteLine($"DEBUG: Pending migrations count: {pendingMigrations.Count()}");
    foreach (var migration in pendingMigrations)
    {
        Console.WriteLine($"DEBUG: Pending migration: {migration}");
    }

    await dbContext.Database.MigrateAsync();
    Console.WriteLine("DEBUG: Database migrations completed successfully");
}
catch (Exception ex)
{
    Console.WriteLine($"ERROR: Database setup failed: {ex.Message}");
    Console.WriteLine($"ERROR: Stack trace: {ex.StackTrace}");
}

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("frontend");
app.UseHttpsRedirection();

// Only use authentication middleware if JWT is configured
if (!string.IsNullOrEmpty(key) && !string.IsNullOrEmpty(issuer) && !string.IsNullOrEmpty(audience))
{
    app.UseAuthentication();
    app.UseAuthorization();
}

app.MapControllers();

app.Run();
