using Ai.Api.Data;
using Ai.Api.Extensions;
using Ai.Api.OpenAI;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Read OpenAI settings
var openAi = builder.Configuration.GetSection("OpenAI");
var openAiApiKey = openAi["ApiKey"] ?? string.Empty;
var openAiBaseUrl = (openAi["BaseUrl"] ?? "https://api.openai.com/v1").TrimEnd('/') + "/";
var openAiModel = openAi["Model"] ?? "gpt-3.5-turbo";
var openAiTemperature = double.TryParse(openAi["Temperature"], out var t) ? t : 0.7;
var openAiMaxTokens = int.TryParse(openAi["MaxTokens"], out var mt) ? mt : 512;
var useMockOnFailure = bool.TryParse(openAi["UseMockOnFailure"], out var umf) ? umf : true;

// Remove authentication for now - make endpoints public like JobTools
// builder.Services.AddAuthentication();
// builder.Services.AddAuthorization();

// CORS for the AI UI app with production domains
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
    "https://*.asafarim.be"  // Wildcard for all subdomains
};

var developmentOrigins = new[]
{
    "http://ai.asafarim.local:5173",
    "http://localhost:5173"
};

// Combine origins based on environment
string[] allowedOrigins = builder.Environment.IsProduction() 
    ? productionOrigins.Concat(corsOriginsEnv?.Split(',') ?? Array.Empty<string>()).ToArray()
    : developmentOrigins.Concat(productionOrigins).ToArray();

builder.Services.AddCors(opts =>
{
    opts.AddPolicy(
        "frontend",
        p => p.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
    );
});

// Swagger/OpenAPI documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

// Host on 5103
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5103);
});

// Add database context
builder.Services.AddDbContext<SharedDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("SharedConnection"))
);

// Register OpenAI service with proper HttpClient configuration
builder.Services.AddHttpClient<IOpenAiService, OpenAiService>(client =>
{
    client.BaseAddress = new Uri(openAiBaseUrl);
    if (!string.IsNullOrWhiteSpace(openAiApiKey))
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", openAiApiKey);
    client.DefaultRequestHeaders.Accept.Add(
        new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json")
    );
});
builder.Services.Configure<OpenAiOptions>(builder.Configuration.GetSection("OpenAI"));

var app = builder.Build();

app.UseCors("frontend");

app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

// Add health endpoint
app.MapGet("/health", () => Results.Ok(new
{
    Status = "Healthy",
    Service = "AI API",
    Version = "1.0.0",
    Environment = app.Environment.EnvironmentName,
    Timestamp = DateTime.UtcNow
}));

// Run the app with automatic migrations
app.MigrateDatabase<SharedDbContext>().Run();
