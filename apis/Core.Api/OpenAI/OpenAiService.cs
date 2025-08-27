using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Core.Api.OpenAI;

public interface IOpenAiService
{
    Task<string> CompleteAsync(
        string systemPrompt,
        string userPrompt,
        CancellationToken ct = default
    );
}

internal sealed class OpenAiService(HttpClient http, OpenAiOptions opts) : IOpenAiService
{
    private readonly HttpClient _http = http;
    private readonly OpenAiOptions _opts = opts;

    public async Task<string> CompleteAsync(
        string systemPrompt,
        string userPrompt,
        CancellationToken ct = default
    )
    {
        var payload = new
        {
            model = _opts.Model,
            temperature = _opts.Temperature,
            max_tokens = _opts.MaxTokens,
            messages = new object[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userPrompt },
            },
        };
        var json = JsonSerializer.Serialize(payload);
        using var req = new HttpRequestMessage(HttpMethod.Post, "chat/completions")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json"),
        };
        using var res = await _http.SendAsync(req, ct);
        res.EnsureSuccessStatusCode();
        using var stream = await res.Content.ReadAsStreamAsync(ct);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
        var content = doc
            .RootElement.GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();
        return content ?? string.Empty;
    }
}

public static class OpenAiServiceCollectionExtensions
{
    public static IServiceCollection AddOpenAi(
        this IServiceCollection services,
        IConfiguration config
    )
    {
        var opts = new OpenAiOptions();
        config.GetSection("OpenAI").Bind(opts);

        services.AddSingleton(opts);
        services.AddHttpClient<IOpenAiService, OpenAiService>(client =>
        {
            client.BaseAddress = new Uri(
                string.IsNullOrWhiteSpace(opts.BaseUrl)
                    ? "https://api.openai.com/v1/"
                    : opts.BaseUrl.TrimEnd('/') + "/"
            );
            var key = opts.ApiKey;
            if (!string.IsNullOrWhiteSpace(key))
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
                    "Bearer",
                    key
                );
            }
            client.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json")
            );
        });
        return services;
    }
}
