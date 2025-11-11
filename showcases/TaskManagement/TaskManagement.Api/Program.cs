using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TaskManagement.Api.Data;
using TaskManagement.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// CORS configuration
var developmentOrigins = new[]
{
    "http://taskmanagement.asafarim.local:5176",
    "http://localhost:5176",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5175",
};

var productionOrigins = new[] { "https://taskmanagement.asafarim.be", "https://www.asafarim.be" };

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
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Tasks API", Version = "v1" });
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

// Add database context
var taskManagementConnection =
    builder.Configuration.GetConnectionString("TaskManagementConnection")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrEmpty(taskManagementConnection))
{
    // Use PostgreSQL for both development and production
    builder.Services.AddDbContext<TaskManagementDbContext>(options =>
        options.UseNpgsql(
            taskManagementConnection,
            npgsqlOptions =>
            {
                npgsqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
                npgsqlOptions.MigrationsAssembly("TaskManagement.Api");
            }
        )
    );
}

// Add services
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();

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

// Run migrations on startup (before middleware)
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<TaskManagementDbContext>();

    // Debug: Check pending migrations
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

    // Always use migrations for both development and production
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

// Add health check endpoint (no auth required)
app.MapGet(
        "/health",
        () =>
        {
            try
            {
                using var scope = app.Services.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<TaskManagementDbContext>();
                var projectCount = dbContext.Projects.Count();
                return Results.Ok(
                    $"TaskManagement API is running. Projects in database: {projectCount}"
                );
            }
            catch (Exception ex)
            {
                return Results.Problem($"Health check failed: {ex.Message}");
            }
        }
    )
    .WithName("HealthCheck")
    .WithOpenApi();

app.UseHttpsRedirection();
app.UseCors("frontend");

// Only use authentication middleware if JWT is configured
if (!string.IsNullOrEmpty(key) && !string.IsNullOrEmpty(issuer) && !string.IsNullOrEmpty(audience))
{
    app.UseAuthentication();
    app.UseAuthorization();
}
app.MapControllers();

app.Run();
