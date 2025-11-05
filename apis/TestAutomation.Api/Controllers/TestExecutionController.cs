using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TestAutomation.Api.DTOs;
using TestAutomation.Api.Services.Interfaces;

namespace TestAutomation.Api.Controllers;

[ApiController]
[Route("api/test-execution")]
public class TestExecutionController : ControllerBase
{
    private readonly ITestExecutionService _testExecutionService;

    public TestExecutionController(ITestExecutionService testExecutionService)
    {
        _testExecutionService = testExecutionService;
    }

    [HttpPost("run")]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> StartRun([FromBody] StartTestRunDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var run = await _testExecutionService.StartTestRunAsync(request, userId);
        return Ok(run);
    }

    [HttpPost("cancel/{runId}")]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> CancelRun([FromRoute] Guid runId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var success = await _testExecutionService.CancelTestRunAsync(runId, userId);
        if (!success) return NotFound();
        return Ok(new { success = true });
    }

    [HttpGet("status/{runId}")]
    [Authorize]
    public async Task<IActionResult> GetStatus([FromRoute] Guid runId)
    {
        var status = await _testExecutionService.GetTestRunStatusAsync(runId);
        if (status == null) return NotFound();
        return Ok(status);
    }
}