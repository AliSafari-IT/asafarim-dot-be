using System.Text.Json;
using Ai.Api.OpenAI;
using Microsoft.AspNetCore.Mvc;
using Shared.Logging;

namespace Ai.Api.Controllers;

[ApiController]
[Route("")]
public sealed class JobToolsController : ControllerBase
{
    private readonly IOpenAiService _ai;

    public JobToolsController(IOpenAiService ai)
    {
        _ai = ai;
    }

    // POST /extract/job
    [HttpPost("extract/job")]
    public async Task<IActionResult> ExtractJob(
        [FromBody] ExtractJobRequest req,
        CancellationToken ct
    )
    {
        var jobText = req?.Text ?? req?.JobDescription ?? string.Empty;
        if (req is null || string.IsNullOrWhiteSpace(jobText))
            return BadRequest(new { error = "Missing job description text" });

        var system =
            "You extract key data from job descriptions. Respond with STRICT JSON ONLY: { title: string, mustHave: string[], niceToHave: string[], keywords: string[] }. Keep arrays concise.";
        var user = $"Job Description:\n{jobText}";
        string content;
        try
        {
            content = await _ai.CompleteAsync(system, user, ct);
        }
        catch (Exception ex)
        {
            SharedLogger.Error("OpenAI error in ExtractJob", ex);
            return StatusCode(500, new { error = "Failed to process job description" });
        }

        var json = ExtractJson(content);
        return Ok(
            JsonSerializer.Deserialize<ExtractJobResponse>(
                json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            )
        );
    }

    // POST /score/match
    [HttpPost("score/match")]
    public IActionResult ScoreMatch([FromBody] ScoreMatchRequest req)
    {
        if (req is null)
            return BadRequest(new { error = "Missing payload" });
        var candidate = new HashSet<string>(
            req.CandidateSkills ?? Array.Empty<string>(),
            StringComparer.OrdinalIgnoreCase
        );
        var job = new HashSet<string>(
            req.JobSkills ?? Array.Empty<string>(),
            StringComparer.OrdinalIgnoreCase
        );
        if (job.Count == 0)
            return Ok(new { score = 0.0 });
        var intersection = candidate.Intersect(job, StringComparer.OrdinalIgnoreCase).Count();
        var score = (double)intersection / job.Count; // simple ratio
        return Ok(new { score });
    }

    // POST /generate/cover-letter
    [HttpPost("generate/cover-letter")]
    public async Task<IActionResult> GenerateCoverLetter(
        [FromBody] GenerateLetterRequest req,
        CancellationToken ct
    )
    {
        if (req is null || string.IsNullOrWhiteSpace(req.JobTitle))
            return BadRequest(new { error = "Missing jobTitle" });

        var system =
            "You write concise, professional cover letters. Respond with plain text paragraphs only.";
        var user =
            $@"Please write a short cover letter.
Job Title: {req.JobTitle}
Company: {req.Company}
Highlights: {string.Join(", ", req.Highlights ?? Array.Empty<string>())}
Tone: {req.Tone ?? "concise"}";
        string content;
        try
        {
            content = await _ai.CompleteAsync(system, user, ct);
        }
        catch (Exception ex)
        {
            SharedLogger.Error("OpenAI error in GenerateCoverLetter", ex);
            return StatusCode(502, new { error = "OpenAI request failed" });
        }

        return Ok(new { letter = content.Trim() });
    }

    // Helpers copied from ResumeController style
    private static string ExtractJson(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            return "{}";
        var trimmed = content.Trim();
        if (trimmed.StartsWith("```"))
        {
            var firstNewline = trimmed.IndexOf('\n');
            if (firstNewline >= 0)
                trimmed = trimmed[(firstNewline + 1)..].Trim();
            if (trimmed.EndsWith("```"))
            {
                var lastFence = trimmed.LastIndexOf("```", StringComparison.Ordinal);
                if (lastFence >= 0)
                    trimmed = trimmed[..lastFence].Trim();
            }
        }
        var start = trimmed.IndexOf('{');
        var end = trimmed.LastIndexOf('}');
        if (start >= 0 && end > start)
        {
            var candidate = trimmed.Substring(start, end - start + 1).Trim();
            try
            {
                using var _ = JsonDocument.Parse(candidate);
                return candidate;
            }
            catch { }
        }
        return "{}";
    }
}

// DTOs
public sealed class ExtractJobRequest
{
    public string Text { get; set; } = string.Empty;
    public string JobDescription { get; set; } = string.Empty;
}

public sealed class ExtractJobResponse
{
    public string Title { get; set; } = string.Empty;
    public string[] MustHave { get; set; } = Array.Empty<string>();
    public string[] NiceToHave { get; set; } = Array.Empty<string>();
    public string[] Keywords { get; set; } = Array.Empty<string>();
}

public sealed class ScoreMatchRequest
{
    public IEnumerable<string>? CandidateSkills { get; set; }
    public IEnumerable<string>? JobSkills { get; set; }
}

public sealed class GenerateLetterRequest
{
    public string JobTitle { get; set; } = string.Empty;
    public string? Company { get; set; }
    public IEnumerable<string>? Highlights { get; set; }
    public string? Tone { get; set; }
}
