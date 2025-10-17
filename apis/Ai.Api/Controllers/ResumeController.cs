using System.Security.Claims;
using System.Text.Json;
using Ai.Api.Models;
using Ai.Api.OpenAI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ai.Api.Controllers;

[ApiController]
[Route("resume")]
public sealed class ResumeController : ControllerBase
{
    private readonly ILogger<ResumeController> _logger;
    private readonly IOpenAiService _ai;

    public ResumeController(ILogger<ResumeController> logger, IOpenAiService ai)
    {
        _logger = logger;
        _ai = ai;
    }

    // Helper methods
    static string ExtractJson(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            return "{}";
        var trimmed = content.Trim();

        // Remove code fences like ```json ... ```
        if (trimmed.StartsWith("```"))
        {
            var firstNewline = trimmed.IndexOf('\n');
            if (firstNewline >= 0)
            {
                trimmed = trimmed[(firstNewline + 1)..].Trim();
            }
            if (trimmed.EndsWith("```"))
            {
                var lastFence = trimmed.LastIndexOf("```", StringComparison.Ordinal);
                if (lastFence >= 0)
                {
                    trimmed = trimmed[..lastFence].Trim();
                }
            }
        }

        // Try full parse
        if (TryParseJson(trimmed, out var strict))
            return strict!;

        // Fallback: take substring between first '{' and last '}'
        var start = trimmed.IndexOf('{');
        var end = trimmed.LastIndexOf('}');
        if (start >= 0 && end > start)
        {
            var candidate = trimmed.Substring(start, end - start + 1).Trim();
            if (TryParseJson(candidate, out strict))
                return strict!;
        }

        // Last resort: return original trimmed
        return trimmed;
    }

    static bool TryParseJson(string text, out string? strict)
    {
        try
        {
            using var doc = JsonDocument.Parse(text);
            strict = text;
            return true;
        }
        catch
        {
            strict = null;
            return false;
        }
    }

    // GET /resume/health - simple health check endpoint to test API connectivity
    [HttpGet("health")]
    public IActionResult HealthCheck()
    {
        return Ok(new { status = "healthy", timestamp = DateTime.UtcNow,
        usage = "This endpoint is used to test API connectivity: https://asafarim.be/api/ai/resume/health" });
    }

    // POST /resume/functional - generate a functional resume from a detailed CV for the logged-in user
    [HttpPost("functional")]
    // Temporarily disabled for testing
    // [Authorize]
    public async Task<IActionResult> GenerateFunctional(
        [FromBody] FunctionalResumeRequest req,
        CancellationToken ct
    )
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        // For testing, use a default user ID if authentication is not available
        var sub =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? "test-user-id";
        // Removed authentication check for testing
        // if (string.IsNullOrWhiteSpace(sub))
        //     return Unauthorized();

        var systemPrompt =
            "You are an expert resume writer. Respond with STRICT JSON ONLY (no code fences, no explanations). The JSON must match this shape: { name: string, email: string, phone?: string, summary: string, skills: string[], projects: [{ title: string, description?: string, highlights?: string[] }], achievements: string[] }. Keep content concise and professional.";
        var userPrompt =
            $@"Candidate:
Name: {req.Name}
Email: {req.Email}
Phone: {req.Phone}
Summary: {req.Summary}
Skills: {string.Join(", ", req.Skills ?? new())}
Detailed CV: {req.DetailedCv ?? "(not provided)"}";

        string content;
        try
        {
            content = await _ai.CompleteAsync(systemPrompt, userPrompt, ct);
        }
        catch (OpenAiUpstreamException ex)
        {
            _logger.LogError(
                ex,
                "OpenAI upstream error generating resume for {UserId}: {Status}",
                sub,
                ex.StatusCode
            );
            return StatusCode(
                ex.StatusCode,
                new { error = "OpenAI request failed", details = ex.Body }
            );
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "OpenAI HTTP error generating resume for {UserId}", sub);
            return StatusCode(502, new { error = "Upstream OpenAI request failed" });
        }
        catch (OperationCanceledException)
        {
            return StatusCode(499, new { error = "Client Closed Request" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error generating resume for {UserId}", sub);
            return StatusCode(500, new { error = "Unexpected server error" });
        }

        // Ensure we return strict JSON: strip fences, extract JSON object, and validate
        var json = ExtractJson(content);
        _logger.LogInformation(
            "AI resume generated for {UserId} with {SkillCount} skills. Strict JSON length: {Len}",
            sub,
            req.Skills?.Count ?? 0,
            json?.Length ?? 0
        );
        return Ok(new { userId = sub, raw = json });
    }
}
