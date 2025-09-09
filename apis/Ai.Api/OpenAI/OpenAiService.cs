using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Linq;
using Microsoft.Extensions.Options;

namespace Ai.Api.OpenAI;

public interface IOpenAiService
{
    Task<string> CompleteAsync(
        string systemPrompt,
        string userPrompt,
        CancellationToken ct = default
    );

    Task<string> ChatAsync(string systemPrompt, string userPrompt, CancellationToken ct = default);

    Task<string> GetChatCompletionAsync(List<string> conversationHistory, CancellationToken ct = default);
}

internal sealed class OpenAiUpstreamException : Exception
{
    public int StatusCode { get; }
    public string? Body { get; }

    public OpenAiUpstreamException(
        string message,
        int statusCode,
        string? body = null,
        Exception? inner = null
    )
        : base(message, inner)
    {
        StatusCode = statusCode;
        Body = body;
    }
}

internal sealed class OpenAiService(HttpClient http, IOptions<OpenAiOptions> opts) : IOpenAiService
{
    private readonly HttpClient _http = http;
    private readonly OpenAiOptions _opts = opts.Value;

    public Task<string> ChatAsync(
        string systemPrompt,
        string userPrompt,
        CancellationToken ct = default
    )
    {
        return CompleteAsync(systemPrompt, userPrompt, ct);
    }

    public async Task<string> GetChatCompletionAsync(List<string> conversationHistory, CancellationToken ct = default)
    {
        if (conversationHistory == null || !conversationHistory.Any())
            return "I'm sorry, I don't have any context to work with. Could you please provide a message?";

        // Extract the last user message
        var lastUserMessage = conversationHistory.LastOrDefault(m => m.StartsWith("user:"));
        if (string.IsNullOrEmpty(lastUserMessage))
            return "I'm sorry, I couldn't understand your message. Could you please try again?";

        var userPrompt = lastUserMessage.Replace("user:", "").Trim();
        
        // Create a system prompt based on the conversation context
        var systemPrompt = "You are a helpful AI career assistant. You help users with career advice, interview tips, job search guidance, and professional development. " +
                          "Use the conversation history to provide contextually relevant and helpful responses. " +
                          "Be professional, encouraging, and provide actionable advice when possible.";

        return await ChatAsync(systemPrompt, userPrompt, ct);
    }

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

        var attempt = 0;
        const int maxAttempts = 3; // initial + 2 retries
        while (true)
        {
            ct.ThrowIfCancellationRequested();
            attempt++;
            using var req = new HttpRequestMessage(HttpMethod.Post, "chat/completions")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json"),
            };
            using var res = await _http.SendAsync(req, ct);
            if (res.IsSuccessStatusCode)
            {
                using var stream = await res.Content.ReadAsStreamAsync(ct);
                using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
                var content = doc
                    .RootElement.GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();
                return content ?? string.Empty;
            }

            var statusInt = (int)res.StatusCode;
            var body = await res.Content.ReadAsStringAsync(ct);

            // Simple retry with backoff for 429 Too Many Requests
            if (statusInt == 429 && attempt < maxAttempts)
            {
                var delayMs = 500 * attempt; // 500ms, 1000ms
                if (res.Headers.TryGetValues("Retry-After", out var vals))
                {
                    var retryAfter = vals.FirstOrDefault();
                    if (int.TryParse(retryAfter, out var seconds) && seconds > 0)
                    {
                        delayMs = Math.Max(delayMs, seconds * 1000);
                    }
                }
                await Task.Delay(delayMs, ct);
                continue;
            }

            throw new OpenAiUpstreamException("OpenAI request failed", statusInt, body);
        }
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
            if (!string.IsNullOrWhiteSpace(opts.Organization))
            {
                // Optional organization header
                client.DefaultRequestHeaders.Remove("OpenAI-Organization");
                client.DefaultRequestHeaders.Add("OpenAI-Organization", opts.Organization);
            }
            client.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json")
            );
        });
        return services;
    }

    public static IOpenAiService GetOpenAiService(this IServiceProvider services)
    {
        return services.GetRequiredService<IOpenAiService>();
    }

    // ChatAsync
    public static Task<string> ChatAsync(
        this IOpenAiService service,
        string systemPrompt,
        string userPrompt
    )
    {
        return service.CompleteAsync(systemPrompt, userPrompt);
    }

    // ChatAsync with cancellation
    public static Task<string> ChatAsync(
        this IOpenAiService service,
        string systemPrompt,
        string userPrompt,
        CancellationToken cancellationToken
    )
    {
        return service.CompleteAsync(systemPrompt, userPrompt, cancellationToken);
    }
}
