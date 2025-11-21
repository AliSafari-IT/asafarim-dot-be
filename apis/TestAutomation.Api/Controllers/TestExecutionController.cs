using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using TestAutomation.Api.DTOs;
using TestAutomation.Api.Hubs;
using TestAutomation.Api.Services.Interfaces;

namespace TestAutomation.Api.Controllers;

[ApiController]
[Route("api/test-execution")]
public class TestExecutionController : ControllerBase
{
    private readonly ITestExecutionService _testExecutionService;
    private readonly IHubContext<TestRunHub> _hubContext;
    private readonly ILogger<TestExecutionController> _logger;

    public TestExecutionController(
        ITestExecutionService testExecutionService,
        IHubContext<TestRunHub> hubContext,
        ILogger<TestExecutionController> _logger
    )
    {
        _testExecutionService = testExecutionService;
        _hubContext = hubContext;
        this._logger = _logger;
    }

    [HttpPost("run")]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> StartRun([FromBody] StartTestRunDto request)
    {
        try
        {
            if (request == null)
            {
                _logger.LogWarning("StartRun called with null request");
                return BadRequest(new { message = "Request body is required" });
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            _logger.LogInformation(
                "Starting test run - RunName: {RunName}, TestSuiteIds: {TestSuiteIds}, TestCaseIds: {TestCaseIds}",
                request.RunName,
                request.TestSuiteIds != null ? string.Join(", ", request.TestSuiteIds) : "none",
                request.TestCaseIds != null ? string.Join(", ", request.TestCaseIds) : "none"
            );

            var run = await _testExecutionService.StartTestRunAsync(request, userId);

            // Add user to SignalR group BEFORE test run completes
            var username = User.Identity?.Name ?? "Unknown";
            _logger.LogInformation($"👥 Adding user {username} to SignalR group testrun-{run.Id}");
            // Note: We can't add to group here because we don't have the connection ID
            // The UI must call JoinTestRun immediately after receiving the runId

            return Ok(run);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error starting test run: {Message}", ex.Message);
            return StatusCode(
                500,
                new
                {
                    message = "Failed to start test run",
                    error = ex.Message,
                    details = ex.StackTrace,
                }
            );
        }
    }

    [HttpPost("cancel/{runId}")]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> CancelRun([FromRoute] Guid runId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var success = await _testExecutionService.CancelTestRunAsync(runId, userId);
        if (!success)
            return NotFound();
        return Ok(new { success = true });
    }

    [HttpGet("status/{runId}")]
    [Authorize]
    public async Task<IActionResult> GetStatus([FromRoute] Guid runId)
    {
        var status = await _testExecutionService.GetTestRunStatusAsync(runId);
        if (status == null)
            return NotFound();
        return Ok(status);
    }

    [HttpGet("runs")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRuns(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50
    )
    {
        var runs = await _testExecutionService.GetTestRunHistoryAsync(pageNumber, pageSize);
        return Ok(runs);
    }
}
