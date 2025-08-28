using System.Text.Json;

namespace Ai.Api.OpenAI;

/// <summary>
/// Mock implementation of OpenAI service for development and testing
/// This avoids the need for a valid API key and handles any model name issues
/// </summary>
public class MockOpenAiService : IOpenAiService
{
    private readonly ILogger<MockOpenAiService> _logger;

    public MockOpenAiService(ILogger<MockOpenAiService> logger)
    {
        _logger = logger;
    }

    public Task<string> ChatAsync(
        string systemPrompt,
        string userPrompt,
        CancellationToken ct = default
    )
    {
        return CompleteAsync(systemPrompt, userPrompt, ct);
    }

    public Task<string> CompleteAsync(
        string systemPrompt,
        string userPrompt,
        CancellationToken ct = default
    )
    {
        _logger.LogInformation(
            "Mock OpenAI service called with system prompt: {SystemPrompt}",
            systemPrompt
        );
        _logger.LogInformation("User prompt: {UserPrompt}", userPrompt);

        // Extract name, email, phone from the user prompt
        string name = ExtractField(userPrompt, "Name:");
        string email = ExtractField(userPrompt, "Email:");
        string phone = ExtractField(userPrompt, "Phone:");
        string summary = ExtractField(userPrompt, "Summary:");
        string skills = ExtractField(userPrompt, "Skills:");

        // Create a mock resume response
        var resume = new
        {
            name = name,
            email = email,
            phone = phone,
            summary = summary,
            skills = skills.Split(',').Select(s => s.Trim()).ToArray(),
            projects = new[]
            {
                new
                {
                    title = "Professional Portfolio Website",
                    description = "Developed a responsive portfolio website to showcase professional achievements",
                    highlights = new[] { "Responsive design", "Modern UI/UX", "SEO optimized" },
                },
                new
                {
                    title = "E-commerce Platform",
                    description = "Built a full-stack e-commerce solution with secure payment processing",
                    highlights = new[]
                    {
                        "Secure checkout",
                        "Inventory management",
                        "User authentication",
                    },
                },
            },
            achievements = new[]
            {
                "Successfully delivered projects on time and within budget",
                "Improved system performance by 40%",
                "Recognized for excellence in team collaboration",
            },
        };

        string jsonResponse = JsonSerializer.Serialize(
            resume,
            new JsonSerializerOptions { WriteIndented = true }
        );
        return Task.FromResult(jsonResponse);
    }

    private string ExtractField(string text, string fieldName)
    {
        int startIndex = text.IndexOf(fieldName);
        if (startIndex == -1)
            return string.Empty;

        startIndex += fieldName.Length;
        int endIndex = text.IndexOf('\n', startIndex);
        if (endIndex == -1)
            endIndex = text.Length;

        return text.Substring(startIndex, endIndex - startIndex).Trim();
    }
}
