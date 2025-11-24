using System.Text.Json;
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

    [HttpPost("result")]
    public async Task<IActionResult> AddResult([FromBody] RunnerTestResultDto dto)
    {
        try
        {
            _logger.LogInformation("📥 Result webhook received: {@Dto}", dto);

            if (string.IsNullOrEmpty(dto.RunId))
            {
                _logger.LogError("❌ RunId is null or empty");
                return BadRequest("RunId is required");
            }

            if (!Guid.TryParse(dto.RunId, out var runId))
            {
                _logger.LogError("❌ Invalid RunId format: {RunId}", dto.RunId);
                return BadRequest("Invalid RunId format");
            }
            _logger.LogInformation("🔍 Looking for test run: {RunId}", runId);

            // Log the incoming DTO for debugging
            _logger.LogInformation(
                "📥 Processing test result for RunId: {RunId}, TestCaseName: {TestCaseName}, Status: {Status}",
                dto.RunId,
                dto.TestCaseName,
                dto.Status
            );

            // Load test run with related entities
            var run = await _db
                .TestRuns.Include(r => r.FunctionalRequirement)
                .FirstOrDefaultAsync(r => r.Id == runId);

            if (run == null)
            {
                _logger.LogError("❌ Test run not found: {RunId}", runId);
                return NotFound($"Test run not found: {runId}");
            }

            // Try to match test case by name if TestCaseId not provided
            Guid? testCaseId = null;
            Guid? testSuiteId = null;
            Guid? fixtureId = null;

            // First, check if TestSuiteId was provided directly
            if (Guid.TryParse(dto.TestSuiteId, out var tsid))
            {
                testSuiteId = tsid;
                _logger.LogInformation("✅ Using provided TestSuiteId: {TestSuiteId}", testSuiteId);
            }

            if (Guid.TryParse(dto.TestCaseId, out var tcid))
            {
                testCaseId = tcid;
                _logger.LogInformation("✅ Using provided TestCaseId: {TestCaseId}", testCaseId);
            }
            else if (!string.IsNullOrEmpty(dto.TestCaseName))
            {
                // Try to find test case by name
                var testCase = await _db
                    .TestCases.Include(tc => tc.TestSuite)
                    .ThenInclude(ts => ts.Fixture)
                    .FirstOrDefaultAsync(tc => tc.Name == dto.TestCaseName);

                if (testCase != null)
                {
                    testCaseId = testCase.Id;
                    testSuiteId = testCase.TestSuiteId; // Override with matched test case's suite if not already set
                    fixtureId = testCase.TestSuite?.FixtureId;
                    _logger.LogInformation(
                        "✅ Found test case by name: {TestCaseName} -> {TestCaseId}",
                        dto.TestCaseName,
                        testCaseId
                    );
                }
                else
                {
                    _logger.LogWarning(
                        "⚠️ Test case not found by name: {TestCaseName}",
                        dto.TestCaseName
                    );
                }
            }
            else
            {
                _logger.LogWarning("⚠️ No TestCaseId or TestCaseName provided in the request");
            }

            // If we have testSuiteId but no fixtureId, load the fixture
            if (testSuiteId.HasValue && !fixtureId.HasValue)
            {
                var suite = await _db.TestSuites.FindAsync(testSuiteId.Value);
                if (suite != null)
                {
                    fixtureId = suite.FixtureId;
                }
            }

            // Parse optional test data set id
            Guid? testDataSetId = null;
            if (
                !string.IsNullOrWhiteSpace(dto.TestDataSetId)
                && Guid.TryParse(dto.TestDataSetId, out var dsid)
            )
            {
                testDataSetId = dsid;
            }

            // Parse status (validated again in service)
            var statusString = string.IsNullOrWhiteSpace(dto.Status) ? "error" : dto.Status;

            var mapped = new TestResultDto
            {
                Id = Guid.Empty,
                TestRunId = run.Id,
                TestCaseId = testCaseId,
                TestSuiteId = testSuiteId,
                FixtureId = fixtureId,
                FunctionalRequirementId = run.FunctionalRequirementId,
                ExecutedById = run.ExecutedById,
                Status = statusString,
                DurationMs = dto.DurationMs,
                ErrorMessage = dto.ErrorMessage,
                StackTrace = dto.StackTrace,
                JsonReport = dto.JsonReport,
                RunAt = DateTime.UtcNow,
                TestCaseName = dto.TestCaseName,
                TestDataSetId = testDataSetId,
            };

            // Delegate persistence and notifications to the service for consistency
            await _testExecutionService.ProcessTestResultAsync(mapped);

            // Return success response
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Unexpected error in AddResult");
            return StatusCode(500, "An unexpected error occurred");
        }
    }
}
