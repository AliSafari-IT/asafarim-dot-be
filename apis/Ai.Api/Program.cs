using Ai.Api.Data;
using Ai.Api.OpenAI;
using Microsoft.AspNetCore.Authentication.JwtBearer;
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

// Add Authentication and Authorization
builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(
        JwtBearerDefaults.AuthenticationScheme,
        options =>
        {
            options.Authority = "http://identity.asafarim.local:5190";
            options.RequireHttpsMetadata = false;
            options.Audience = "asafarim.be";
        }
    );

builder.Services.AddAuthorization();

// CORS for the AI UI app
builder.Services.AddCors(opts =>
{
    opts.AddPolicy(
        "frontend",
        p =>
            p.WithOrigins(
                "http://ai.asafarim.local:5173",
                "https://ai.asafarim.local:5173",
                "https://ai.asafarim.be",
                "https://asafarim.be"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
    );
});

// Swagger/OpenAPI configuration
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();
builder.Services.AddHttpClient(
    "openai",
    client =>
    {
        client.BaseAddress = new Uri(openAiBaseUrl);
        if (!string.IsNullOrWhiteSpace(openAiApiKey))
            client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", openAiApiKey);
        client.DefaultRequestHeaders.Accept.Add(
            new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json")
        );
    }
);

// Kestrel configuration is now handled through environment variables in the service file

// Add database context
builder.Services.AddDbContext<SharedDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("SharedConnection"))
);

// Register OpenAI service
builder.Services.AddScoped<IOpenAiService, OpenAiService>();
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

app.Run();
