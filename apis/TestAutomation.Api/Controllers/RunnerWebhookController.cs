using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestAutomation.Api.Data;
using TestAutomation.Api.DTOs;
using TestAutomation.Api.Models;

namespace TestAutomation.Api.Controllers;

[ApiController]
[Route("api/runner-webhook")] 
public class RunnerWebhookController : ControllerBase
{
    private readonly TestAutomationDbContext _db;
    private readonly ILogger<RunnerWebhookController> _logger;

    public RunnerWebhookController(TestAutomationDbContext db, ILogger<RunnerWebhookController> logger)
    {
        _db = db;
        _logger = logger;
    }

    [HttpPost("status")] // Called by Node runner to update overall run status
    public async Task<IActionResult> UpdateStatus([FromBody] RunnerStatusUpdateDto dto)
    {
        if (!Guid.TryParse(dto.RunId, out var runId)) return BadRequest();
        var run = await _db.TestRuns.FirstOrDefaultAsync(r => r.Id == runId);
        if (run == null) return NotFound();
        if (Enum.TryParse<TestRunStatus>(dto.Status, true, out var status))
        {
            run.Status = status;
        }
        if (status is TestRunStatus.Completed or TestRunStatus.Failed or TestRunStatus.Cancelled)
        {
            run.CompletedAt = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpPost("result")] // Called by Node runner per test case
    public async Task<IActionResult> AddResult([FromBody] RunnerTestResultDto dto)
    {
        if (!Guid.TryParse(dto.RunId, out var runId)) return BadRequest();
        var run = await _db.TestRuns.FirstOrDefaultAsync(r => r.Id == runId);
        if (run == null) return NotFound();

        var result = new TestResult
        {
            Id = Guid.NewGuid(),
            TestRunId = run.Id,
            TestCaseId = Guid.TryParse(dto.TestCaseId, out var tcid) ? tcid : null,
            Status = Enum.TryParse<TestStatus>(dto.Status, true, out var st) ? st : TestStatus.Error,
            DurationMs = dto.DurationMs,
            ErrorMessage = dto.ErrorMessage,
            StackTrace = dto.StackTrace,
            JsonReport = dto.JsonReport == null ? null : System.Text.Json.JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(dto.JsonReport)),
            RunAt = DateTime.UtcNow
        };
        _db.TestResults.Add(result);
        await _db.SaveChangesAsync();
        return Ok(new { id = result.Id });
    }
}