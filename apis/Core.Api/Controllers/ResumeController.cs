using System.Security.Claims;
using Core.Api.Models;
using Core.Api.OpenAI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Core.Api.Controllers;

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
    public IActionResult GenerateFunctional([FromBody] FunctionalResumeRequest req)
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
            content = _ai.CompleteAsync(systemPrompt, userPrompt).GetAwaiter().GetResult();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating resume for {UserId}", sub);
            return StatusCode(
                500,
                new { error = "Failed to generate resume. Please try again later." }
            );
        }

        _logger.LogInformation(
            "AI resume generated for {UserId} with {SkillCount} skills",
            sub,
            req.Skills?.Count ?? 0
        );
        return Ok(new { userId = sub, raw = content });
    }
}
