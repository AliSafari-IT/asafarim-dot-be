using System.Text;
using FreelanceToolkit.Api.BackgroundServices;
using FreelanceToolkit.Api.Data;
using FreelanceToolkit.Api.Services;
using FreelanceToolkit.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/freelance-toolkit-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database (business data only - proposals, invoices, etc.)
var dataSourceBuilder = new NpgsqlDataSourceBuilder(
    builder.Configuration.GetConnectionString("DefaultConnection")
);
dataSourceBuilder.EnableDynamicJson();
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(dataSource));

// JWT Authentication - validate tokens from Identity.Api
var jwtKey = builder.Configuration["AuthJwt:Key"];
var jwtIssuer = builder.Configuration["AuthJwt:Issuer"];
var jwtAudience = builder.Configuration["AuthJwt:Audience"];

if (
    !string.IsNullOrEmpty(jwtKey)
    && !string.IsNullOrEmpty(jwtIssuer)
    && !string.IsNullOrEmpty(jwtAudience)
)
{
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
                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                ClockSkew = TimeSpan.Zero,
            };

            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    var logger = context.HttpContext.RequestServices.GetRequiredService<
                        ILogger<Program>
                    >();
                    logger.LogError("Authentication failed: {Error}", context.Exception.Message);
                    return Task.CompletedTask;
                },
                OnMessageReceived = context =>
                {
                    var logger = context.HttpContext.RequestServices.GetRequiredService<
                        ILogger<Program>
                    >();

                    // Log all cookies for debugging
                    logger.LogInformation(
                        "🍪 Cookies received: {Cookies}",
                        string.Join(", ", context.Request.Cookies.Select(c => c.Key))
                    );

                    // Try to get token from Authorization header first
                    var token = context
                        .Request.Headers["Authorization"]
                        .FirstOrDefault()
                        ?.Split(" ")
                        .Last();

                    // If no Authorization header, try to get from cookie
                    if (string.IsNullOrEmpty(token))
                    {
                        // Try 'atk' (access token) cookie first, then fallback to 'AuthToken'
                        token =
                            context.Request.Cookies["atk"] ?? context.Request.Cookies["AuthToken"];
                        if (!string.IsNullOrEmpty(token))
                        {
                            context.Token = token;
                            logger.LogInformation(
                                "✅ Token received from cookie for {Path}",
                                context.Request.Path
                            );
                        }
                        else
                        {
                            logger.LogWarning(
                                "❌ No auth cookie found for {Path}",
                                context.Request.Path
                            );
                        }
                    }
                    else
                    {
                        logger.LogInformation(
                            "✅ Token received from header for {Path}",
                            context.Request.Path
                        );
                    }

                    return Task.CompletedTask;
                },
            };
        });
}
else
{
    Console.WriteLine(
        "WARNING: JWT authentication not configured. Authentication will be disabled."
    );
}

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Application Services
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IProposalService, ProposalService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<ICalendarService, CalendarService>();
builder.Services.AddScoped<IPdfService, PdfService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IEmailRetryService, EmailRetryService>();

// Email Retry Configuration
builder.Services.Configure<EmailRetryConfiguration>(builder.Configuration.GetSection("EmailRetry"));

// Background Services
builder.Services.AddHostedService<EmailRetryBackgroundService>();

// CORS - Allow frontend origins
var productionOrigins = new[]
{
    "https://asafarim.be",
    "https://www.asafarim.be",
    "https://freelance-toolkit.asafarim.be",
};

var developmentOrigins = new[]
{
    "http://freelance-toolkit.asafarim.local:5185",
    "http://localhost:5185",
    "http://localhost:5173",
    "http://localhost:5174",
};

var allowedOrigins = builder.Environment.IsProduction()
    ? productionOrigins
    : developmentOrigins.Concat(productionOrigins).ToArray();

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowFreelanceToolkit",
        policy =>
        {
            policy.WithOrigins(allowedOrigins).AllowAnyMethod().AllowAnyHeader().AllowCredentials();
        }
    );
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSerilogRequestLogging();

app.UseCors("AllowFreelanceToolkit");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Apply migrations
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        await context.Database.MigrateAsync();
        // Note: User seeding is now handled by Identity.Api
        // await SeedData.Initialize(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred with database migration.");
    }
}

app.Run();
