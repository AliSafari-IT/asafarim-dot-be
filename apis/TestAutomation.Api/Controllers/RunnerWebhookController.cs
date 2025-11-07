using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TestAutomation.Api.Data;
using TestAutomation.Api.DTOs;
using TestAutomation.Api.Hubs;
using TestAutomation.Api.Models;
using TestAutomation.Api.Services.Interfaces;

namespace TestAutomation.Api.Controllers;

[ApiController]
[Route("api/runner-webhook")]
public class RunnerWebhookController : ControllerBase
{
    private readonly TestAutomationDbContext _db;
    private readonly ILogger<RunnerWebhookController> _logger;
    private readonly IHubContext<TestRunHub> _hubContext;
    private readonly ITestExecutionService _testExecutionService;

    public RunnerWebhookController(
        TestAutomationDbContext db,
        ILogger<RunnerWebhookController> logger,
        IHubContext<TestRunHub> hubContext,
        ITestExecutionService testExecutionService
    )
    {
        _db = db;
        _logger = logger;
        _hubContext = hubContext;
        _testExecutionService = testExecutionService;
    }

    [HttpPost("status")] // Called by Node runner to update overall run status
    public async Task<IActionResult> UpdateStatus([FromBody] RunnerStatusUpdateDto dto)
    {
        _logger.LogInformation(
            $"📥 Webhook received: RunId={dto.RunId}, Status={dto.Status}, Total={dto.TotalTests}, Passed={dto.PassedTests}, Failed={dto.FailedTests}"
        );

        if (!Guid.TryParse(dto.RunId, out var runId))
            return BadRequest();
        var run = await _db.TestRuns.FirstOrDefaultAsync(r => r.Id == runId);
        if (run == null)
            return NotFound();
        // Update the test run status and result counts using the service method
        await _testExecutionService.UpdateTestRunStatusAsync(
            runId,
            dto.Status,
            dto.TotalTests,
            dto.PassedTests,
            dto.FailedTests
        );

        // Refresh the run from the database to get the latest values
        run = await _db.TestRuns.FindAsync(runId);
        if (run == null)
            return NotFound();

        // Broadcast to connected clients
        _logger.LogInformation($"📤 Broadcasting TestRunUpdated to group testrun-{runId}");
        await _hubContext
            .Clients.Group($"testrun-{runId}")
            .SendAsync(
                "TestRunUpdated",
                new
                {
                    status = dto.Status,
                    totalTests = dto.TotalTests,
                    passedTests = dto.PassedTests,
                    failedTests = dto.FailedTests,
                }
            );

        if (
            Enum.TryParse<TestRunStatus>(dto.Status, true, out var status)
            && (
                status == TestRunStatus.Completed
                || status == TestRunStatus.Failed
                || status == TestRunStatus.Cancelled
            )
        )
        {
            _logger.LogInformation($"📤 Broadcasting TestRunCompleted to group testrun-{runId}");
            await _hubContext
                .Clients.Group($"testrun-{runId}")
                .SendAsync(
                    "TestRunCompleted",
                    new
                    {
                        status = dto.Status,
                        totalTests = dto.TotalTests,
                        passedTests = dto.PassedTests,
                        failedTests = dto.FailedTests,
                    }
                );
        }

        return Ok();
    }

    [HttpPost("result")] // Called by Node runner per test case
    public async Task<IActionResult> AddResult([FromBody] RunnerTestResultDto dto)
    {
        if (!Guid.TryParse(dto.RunId, out var runId))
            return BadRequest();
        
        // Load test run with related entities
        var run = await _db.TestRuns
            .Include(r => r.FunctionalRequirement)
            .FirstOrDefaultAsync(r => r.Id == runId);
        if (run == null)
            return NotFound();

        // Try to match test case by name if TestCaseId not provided
        Guid? testCaseId = null;
        Guid? testSuiteId = null;
        Guid? fixtureId = null;
        
        if (Guid.TryParse(dto.TestCaseId, out var tcid))
        {
            testCaseId = tcid;
        }
        else if (!string.IsNullOrEmpty(dto.TestCaseName))
        {
            // Try to find test case by name
            var testCase = await _db.TestCases
                .Include(tc => tc.TestSuite)
                .ThenInclude(ts => ts.Fixture)
                .FirstOrDefaultAsync(tc => tc.Name == dto.TestCaseName);
            
            if (testCase != null)
            {
                testCaseId = testCase.Id;
                testSuiteId = testCase.TestSuiteId;
                fixtureId = testCase.TestSuite?.FixtureId;
            }
        }

        var result = new TestResult
        {
            Id = Guid.NewGuid(),
            TestRunId = run.Id,
            TestCaseId = testCaseId,
            TestSuiteId = testSuiteId,
            FixtureId = fixtureId,
            FunctionalRequirementId = run.FunctionalRequirementId,
            ExecutedById = run.ExecutedById,
            Status = Enum.TryParse<TestStatus>(dto.Status, true, out var st)
                ? st
                : TestStatus.Error,
            DurationMs = dto.DurationMs,
            ErrorMessage = dto.ErrorMessage,
            StackTrace = dto.StackTrace,
            JsonReport =
                dto.JsonReport == null
                    ? null
                    : System.Text.Json.JsonDocument.Parse(
                        System.Text.Json.JsonSerializer.Serialize(dto.JsonReport)
                    ),
            RunAt = DateTime.UtcNow,
        };
        _db.TestResults.Add(result);
        await _db.SaveChangesAsync();

        // Broadcast individual test result to connected clients
        _logger.LogInformation($"📤 Broadcasting TestResultAdded to group testrun-{runId}");
        await _hubContext
            .Clients.Group($"testrun-{runId}")
            .SendAsync(
                "TestResultAdded",
                new
                {
                    id = result.Id,
                    testRunId = result.TestRunId,
                    testCaseId = result.TestCaseId,
                    status = result.Status.ToString(),
                    durationMs = result.DurationMs,
                    errorMessage = result.ErrorMessage,
                    runAt = result.RunAt,
                }
            );

        return Ok(new { id = result.Id });
    }
}
