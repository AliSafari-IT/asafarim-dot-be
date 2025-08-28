using System.Security.Claims;
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

    // GET /resume/health - simple health check endpoint to test API connectivity
    [HttpGet("health")]
    public IActionResult HealthCheck()
    {
        return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
    }

    // POST /resume/functional - generate a functional resume from a detailed CV for the logged-in user
    [HttpPost("functional")]
    // Temporarily disabled for testing
    // [Authorize]
    public async Task<IActionResult> GenerateFunctional([FromBody] FunctionalResumeRequest req, CancellationToken ct)
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
            "You are an expert resume writer. Produce a concise functional resume in JSON with keys: name, email, phone, summary, skills[], projects[{title, description, highlights[]}], achievements[].";
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
            _logger.LogError(ex, "OpenAI upstream error generating resume for {UserId}: {Status}", sub, ex.StatusCode);
            return StatusCode(ex.StatusCode, new { error = "OpenAI request failed", details = ex.Body });
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

        _logger.LogInformation(
            "AI resume generated for {UserId} with {SkillCount} skills",
            sub,
            req.Skills?.Count ?? 0
        );
        return Ok(new { userId = sub, raw = content });
    }

    // Real chat endpoint using OpenAI Chat Completions
    [HttpPost("chat")]
    [HttpPost("~/chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request, CancellationToken ct)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Prompt))
            return BadRequest(new { error = "Missing prompt" });

        const string systemPrompt = "You are a helpful assistant for ASafariM.";

        try
        {
            var answer = await _ai.ChatAsync(systemPrompt, request.Prompt, ct);
            return Ok(new { answer });
        }
        catch (OpenAiUpstreamException ex)
        {
            _logger.LogError(ex, "OpenAI upstream error during chat: {Status}", ex.StatusCode);
            return StatusCode(
                ex.StatusCode,
                new { error = "OpenAI request failed", details = ex.Body }
            );
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "OpenAI HTTP error during chat");
            return StatusCode(502, new { error = "Upstream OpenAI request failed" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during chat");
            return StatusCode(500, new { error = "Unexpected server error" });
        }
    }
}
