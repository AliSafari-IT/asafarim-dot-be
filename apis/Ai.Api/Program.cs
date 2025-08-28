using Ai.Api.OpenAI;

var builder = WebApplication.CreateBuilder(args);

// Read OpenAI settings
var openAi = builder.Configuration.GetSection("OpenAI");
var openAiApiKey = openAi["ApiKey"] ?? string.Empty;
var openAiBaseUrl = (openAi["BaseUrl"] ?? "https://api.openai.com/v1").TrimEnd('/') + "/";
var openAiModel = openAi["Model"] ?? "gpt-3.5-turbo";
var openAiTemperature = double.TryParse(openAi["Temperature"], out var t) ? t : 0.7;
var openAiMaxTokens = int.TryParse(openAi["MaxTokens"], out var mt) ? mt : 512;
var useMockOnFailure = bool.TryParse(openAi["UseMockOnFailure"], out var umf) ? umf : true;

// CORS for the AI UI app
builder.Services.AddCors(opts =>
{
    opts.AddPolicy(
        "frontend",
        p =>
            p.WithOrigins("http://ai.asafarim.local:5173")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
    );
});

// Minimal OpenAPI in Dev
builder.Services.AddOpenApi();
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


// Host on 5103
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5103);
});

// Register OpenAI service
builder.Services.AddOpenAi(builder.Configuration);

var app = builder.Build();

app.UseCors("frontend");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapControllers();


app.Run();
