using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using TestAutomation.Api;
using TestAutomation.Api.Data;
using TestAutomation.Api.Hubs;
using TestAutomation.Api.Models;
using TestAutomation.Api.Services;
using TestAutomation.Api.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/testora-api-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder
    .Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new TestTypeStringConverter());
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter()
        );
        options.JsonSerializerOptions.PropertyNamingPolicy = System
            .Text
            .Json
            .JsonNamingPolicy
            .CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.ReferenceHandler = System
            .Text
            .Json
            .Serialization
            .ReferenceHandler
            .IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Test Automation API", Version = "v1" });
    c.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer",
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
                Array.Empty<string>()
            },
        }
    );
});

// Configure Database
var testAutomationConnection =
    builder.Configuration.GetConnectionString("TestAutomationConnection")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<TestAutomationDbContext>(options =>
    options.UseNpgsql(testAutomationConnection)
);

// Configure to use existing Identity.Api for authentication
// No local identity configuration needed as we use SSO

// Configure JWT Authentication to validate tokens from Identity.Api
var identityApiSettings = builder.Configuration.GetSection("AuthJwt");
var secretKey = Encoding.ASCII.GetBytes(
    identityApiSettings["Key"] ?? throw new InvalidOperationException("JWT Key not configured")
);

builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = true;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(secretKey),
            ValidateIssuer = true,
            ValidIssuer = identityApiSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = identityApiSettings["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
        };

        // Configure SignalR authentication and cookie token support
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var path = context.HttpContext.Request.Path;

                // 1) SignalR: token via querystring
                var qsToken = context.Request.Query["access_token"].ToString();
                if (!string.IsNullOrEmpty(qsToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = qsToken;
                    return Task.CompletedTask;
                }

                // 2) Bearer header (default)
                var auth = context.Request.Headers["Authorization"].ToString();
                if (!string.IsNullOrEmpty(auth))
                {
                    return Task.CompletedTask;
                }

                // 3) Fallback: JWT in httpOnly cookie from Identity.Api
                if (
                    context.Request.Cookies.TryGetValue("atk", out var cookieToken)
                    && !string.IsNullOrEmpty(cookieToken)
                )
                {
                    context.Token = cookieToken;
                }
                return Task.CompletedTask;
            },
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("TesterOnly", policy => policy.RequireRole("tester", "developer", "admin"));
    options.AddPolicy("DeveloperOnly", policy => policy.RequireRole("developer", "admin"));
});

// Configure AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Configure MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

// Configure Data Protection for encryption
builder
    .Services.AddDataProtection()
    .SetApplicationName("TestAutomation.Api")
    .PersistKeysToFileSystem(
        new DirectoryInfo(Path.Combine(builder.Environment.ContentRootPath, "keys"))
    );

// Register Services
builder.Services.AddScoped<IIdentityApiClient, IdentityApiClient>();
builder.Services.AddScoped<ITestExecutionService, TestExecutionService>();
builder.Services.AddScoped<TestCafeGeneratorService>();
builder.Services.AddSingleton<IEncryptionService, EncryptionService>();
builder.Services.AddScoped<IGitHubActionsService, GitHubActionsService>();
builder.Services.AddHttpClient<IGitHubActionsService, GitHubActionsService>();

// Configure SignalR
builder.Services.AddSignalR();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AppCors",
        policy =>
        {
            if (builder.Environment.IsDevelopment())
            {
                // Allow UI, TestRunner, and production origins
                policy
                    .WithOrigins(
                        "http://testora.asafarim.local:5180", // Frontend UI
                        "http://localhost:4000", // TestRunner service
                        "http://testora.asafarim.local:5106", // API itself (for TestRunner)
                        "https://testora.asafarim.be" // Production
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            }
            else
            {
                var allowed =
                    builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                    ?? Array.Empty<string>();
                policy.WithOrigins(allowed).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
            }
        }
    );
});

// Add HttpClient for TestCafe runner communication
builder.Services.AddHttpClient(
    "TestRunnerClient",
    client =>
    {
        client.BaseAddress = new Uri(
            builder.Configuration["TestRunner:BaseUrl"] ?? "http://localhost:4000"
        );
        client.Timeout = TimeSpan.FromMinutes(30);
    }
);

var app = builder.Build();

// Configure middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSerilogRequestLogging();

// Only redirect HTTPS in non-development to avoid localhost/port redirects breaking CORS
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AppCors");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<TestRunHub>("/hubs/testrun");

// Ensure database is created and migrations are applied
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<TestAutomationDbContext>();
    dbContext.Database.Migrate();
}

app.Run();
