using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestAutomation.Api.Data;
using TestAutomation.Api.DTOs;
using TestAutomation.Api.Models;

namespace TestAutomation.Api.Controllers;

[ApiController]
[Route("api/test-runs")]
[Authorize]
public class TestRunsController : ControllerBase
{
    private readonly TestAutomationDbContext _db;
    private readonly ILogger<TestRunsController> _logger;
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IServiceScopeFactory _serviceScopeFactory;

    public TestRunsController(
        TestAutomationDbContext db,
        ILogger<TestRunsController> logger,
        IConfiguration config,
        IHttpClientFactory httpClientFactory,
        IServiceScopeFactory serviceScopeFactory
    )
    {
        _db = db;
        _logger = logger;
        _config = config;
        _httpClientFactory = httpClientFactory;
        _serviceScopeFactory = serviceScopeFactory;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var runs = await _db
            .TestRuns.Include(r => r.FunctionalRequirement)
            .OrderByDescending(r => r.StartedAt)
            .Select(r => new
            {
                id = r.Id,
                runName = r.RunName,
                functionalRequirement = r.FunctionalRequirement != null
                    ? r.FunctionalRequirement.Name
                    : null,
                environment = r.Environment,
                browser = r.Browser,
                status = r.Status.ToString(),
                startedAt = r.StartedAt,
                completedAt = r.CompletedAt,
                totalTests = r.TotalTests,
                passedTests = r.PassedTests,
                failedTests = r.FailedTests,
                skippedTests = r.SkippedTests,
                successRate = r.TotalTests > 0 ? (double)r.PassedTests / r.TotalTests * 100 : 0,
            })
            .ToListAsync();

        return Ok(runs);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var run = await _db
            .TestRuns.Include(r => r.FunctionalRequirement)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (run == null)
            return NotFound();

        return Ok(
            new
            {
                id = run.Id,
                runName = run.RunName,
                functionalRequirementId = run.FunctionalRequirementId,
                functionalRequirementName = run.FunctionalRequirement?.Name,
                environment = run.Environment,
                browser = run.Browser,
                status = run.Status.ToString(),
                startedAt = run.StartedAt,
                completedAt = run.CompletedAt,
                executedById = run.ExecutedById,
                triggerType = run.TriggerType.ToString(),
                totalTests = run.TotalTests,
                passedTests = run.PassedTests,
                failedTests = run.FailedTests,
                skippedTests = run.SkippedTests,
                successRate = run.TotalTests > 0
                    ? (double)run.PassedTests / run.TotalTests * 100
                    : 0,
            }
        );
    }

    [HttpGet("{id}/results")]
    public async Task<IActionResult> GetResults(Guid id, [FromQuery] string? status = null)
    {
        _logger.LogInformation(
            "🔍 GetResults called for TestRunId: {TestRunId}, Status filter: {Status}",
            id,
            status ?? "all"
        );

        var run = await _db.TestRuns.FindAsync(id);
        if (run == null)
        {
            _logger.LogWarning("❌ Test run {TestRunId} not found", id);
            return NotFound();
        }

        var query = _db.TestResults.Include(r => r.TestCase).Where(r => r.TestRunId == id);

        if (!string.IsNullOrEmpty(status))
        {
            if (Enum.TryParse<TestStatus>(status, true, out var statusEnum))
            {
                query = query.Where(r => r.Status == statusEnum);
            }
        }

        var results = await query.OrderBy(r => r.RunAt).ToListAsync();

        _logger.LogInformation(
            "✅ Found {Count} test results for TestRunId: {TestRunId}",
            results.Count,
            id
        );

        return Ok(
            results.Select(r => new
            {
                id = r.Id,
                testRunId = r.TestRunId,
                testCaseId = r.TestCaseId,
                testCaseName = r.TestCase?.Name,
                status = r.Status.ToString(),
                durationMs = r.DurationMs,
                errorMessage = r.ErrorMessage,
                stackTrace = r.StackTrace,
                runAt = r.RunAt,
                hasJsonReport = r.JsonReport != null,
            })
        );
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadReport(Guid id, [FromQuery] string format = "json")
    {
        var run = await _db
            .TestRuns.Include(r => r.FunctionalRequirement)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (run == null)
            return NotFound();

        var results = await _db
            .TestResults.Include(r => r.TestCase)
            .Where(r => r.TestRunId == id)
            .OrderBy(r => r.RunAt)
            .ToListAsync();

        if (format.ToLower() == "json")
        {
            var report = new
            {
                testRun = new
                {
                    id = run.Id,
                    runName = run.RunName,
                    functionalRequirement = run.FunctionalRequirement?.Name,
                    environment = run.Environment,
                    browser = run.Browser,
                    status = run.Status.ToString(),
                    startedAt = run.StartedAt,
                    completedAt = run.CompletedAt,
                    duration = run.CompletedAt.HasValue
                        ? (run.CompletedAt.Value - run.StartedAt!.Value).TotalSeconds
                        : 0,
                    totalTests = run.TotalTests,
                    passedTests = run.PassedTests,
                    failedTests = run.FailedTests,
                    skippedTests = run.SkippedTests,
                    successRate = run.TotalTests > 0
                        ? (double)run.PassedTests / run.TotalTests * 100
                        : 0,
                },
                results = results.Select(r => new
                {
                    testCaseName = r.TestCase?.Name,
                    status = r.Status.ToString(),
                    durationMs = r.DurationMs,
                    errorMessage = r.ErrorMessage,
                    stackTrace = r.StackTrace,
                    runAt = r.RunAt,
                }),
                generatedAt = DateTime.UtcNow,
            };

            var json = System.Text.Json.JsonSerializer.Serialize(
                report,
                new System.Text.Json.JsonSerializerOptions { WriteIndented = true }
            );

            return File(
                System.Text.Encoding.UTF8.GetBytes(json),
                "application/json",
                $"test-report-{run.RunName}-{DateTime.UtcNow:yyyyMMdd-HHmmss}.json"
            );
        }
        else if (format.ToLower() == "html")
        {
            var html = GenerateHtmlReport(run, results);
            return File(
                System.Text.Encoding.UTF8.GetBytes(html),
                "text/html",
                $"test-report-{run.RunName}-{DateTime.UtcNow:yyyyMMdd-HHmmss}.html"
            );
        }

        return BadRequest("Invalid format. Use 'json' or 'html'");
    }

    [HttpPost("{id}/stop")]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> StopRun(Guid id)
    {
        var run = await _db.TestRuns.FindAsync(id);
        if (run == null)
            return NotFound();

        if (run.Status != TestRunStatus.Running)
            return BadRequest("Test run is not currently running");

        run.Status = TestRunStatus.Cancelled;
        run.CompletedAt = DateTime.UtcNow;
        run.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        // TODO: Send signal to TestRunner to abort execution
        // This requires TestRunner to listen for abort signals

        return Ok(new { success = true, message = "Test run stopped" });
    }

    [HttpPost("{id}/rerun-failed")]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> RerunFailedTests(Guid id)
    {
        var originalRun = await _db
            .TestRuns.Include(r => r.FunctionalRequirement)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (originalRun == null)
            return NotFound();

        // Get failed test results from the original run
        var failedResults = await _db
            .TestResults.Include(r => r.TestCase)
            .ThenInclude(tc => tc.TestSuite)
            .Where(r => r.TestRunId == id && r.Status == TestStatus.Failed)
            .ToListAsync();

        if (!failedResults.Any())
            return BadRequest("No failed tests to rerun");

        // Create a new test run for the retry
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var newRun = new TestRun
        {
            Id = Guid.NewGuid(),
            RunName = $"{originalRun.RunName} - Retry",
            FunctionalRequirementId = originalRun.FunctionalRequirementId,
            Environment = originalRun.Environment,
            Browser = originalRun.Browser,
            Status = TestRunStatus.Running,
            StartedAt = DateTime.UtcNow,
            ExecutedById = Guid.TryParse(userId, out var uid) ? uid : null,
            TriggerType = TriggerType.Manual,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedById = Guid.TryParse(userId, out var uidc) ? uidc : null,
            UpdatedById = Guid.TryParse(userId, out var uidu) ? uidu : null,
        };

        _db.TestRuns.Add(newRun);
        await _db.SaveChangesAsync();

        // Get unique test case IDs
        var testCaseIds = failedResults
            .Where(r => r.TestCaseId.HasValue)
            .Select(r => r.TestCaseId!.Value)
            .Distinct()
            .ToList();

        // Start the test execution using TestExecutionService
        var startRequest = new StartTestRunDto
        {
            RunName = newRun.RunName,
            FunctionalRequirementId = newRun.FunctionalRequirementId,
            Environment = newRun.Environment ?? "Development",
            Browser = newRun.Browser ?? "chrome",
            TestCaseIds = testCaseIds,
        };

        // Trigger test execution in background with new scope
        _ = Task.Run(async () =>
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<TestAutomationDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<TestRunsController>>();

            try
            {
                logger.LogInformation(
                    "🔄 Starting background task to rerun {Count} failed test cases",
                    testCaseIds.Count
                );

                // Build payload for TestRunner - include TestSuite and Fixture info
                var testCases = await db
                    .TestCases.Where(tc => testCaseIds.Contains(tc.Id))
                    .Include(tc => tc.TestDataSets)
                    .Include(tc => tc.TestSuite)
                    .ThenInclude(ts => ts.Fixture)
                    .ToListAsync();

                logger.LogInformation(
                    "📦 Loaded {Count} test cases from database",
                    testCases.Count
                );

                // Group test cases by test suite to include fixture info
                var testSuiteGroups = testCases
                    .GroupBy(tc => tc.TestSuiteId)
                    .Select(g =>
                    {
                        var firstTestCase = g.First();
                        var testSuite = firstTestCase.TestSuite;
                        var fixture = testSuite?.Fixture;

                        return new
                        {
                            id = testSuite?.Id,
                            name = testSuite?.Name,
                            fixtureId = fixture?.Id,
                            pageUrl = fixture?.PageUrl ?? "about:blank",
                            testCases = g.Select(tc =>
                                {
                                    var stepsJson = tc.Steps?.RootElement.GetRawText();
                                    return new
                                    {
                                        id = tc.Id,
                                        name = tc.Name,
                                        testType = tc.TestType.ToString().ToLower(),
                                        steps = stepsJson != null
                                            ? System.Text.Json.JsonSerializer.Deserialize<object>(
                                                stepsJson
                                            )
                                            : null,
                                        scriptText = tc.ScriptText,
                                        testDataSets = tc
                                            .TestDataSets.Where(d => d.IsActive)
                                            .Select(d => new
                                            {
                                                id = d.Id,
                                                name = d.Name,
                                                data = System.Text.Json.JsonSerializer.Deserialize<object>(
                                                    d.Data.RootElement.GetRawText()
                                                ),
                                            }),
                                    };
                                })
                                .Cast<object>()
                                .ToList(),
                        };
                    })
                    .Cast<object>()
                    .ToList();

                var payload = new
                {
                    runId = newRun.Id.ToString(),
                    runName = newRun.RunName,
                    functionalRequirementId = newRun.FunctionalRequirementId?.ToString(),
                    environment = newRun.Environment,
                    browser = newRun.Browser,
                    apiUrl = _config["ApiBaseUrl"] ?? "http://localhost:5200",
                    userId,
                    testSuites = testSuiteGroups,
                    testCases = new List<object>(),
                };

                logger.LogInformation(
                    "🚀 Sending payload to TestRunner at http://localhost:4000/run-tests"
                );
                logger.LogInformation(
                    "📋 Payload: {Payload}",
                    System.Text.Json.JsonSerializer.Serialize(payload)
                );

                var httpClientFactory =
                    scope.ServiceProvider.GetRequiredService<IHttpClientFactory>();
                var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

                var client = httpClientFactory.CreateClient("TestRunnerClient");
                client.DefaultRequestHeaders.Add("x-api-key", config["TestRunner:ApiKey"] ?? "");

                var response = await client.PostAsJsonAsync(
                    "http://localhost:4000/run-tests",
                    payload
                );

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    logger.LogError(
                        "❌ Failed to start test runner for rerun: {StatusCode} - {Error}",
                        response.StatusCode,
                        errorContent
                    );
                }
                else
                {
                    logger.LogInformation("✅ Successfully triggered test runner for rerun");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "❌ Error starting test runner for rerun");
            }
        });

        // Return the new run ID
        return Ok(
            new
            {
                runId = newRun.Id,
                originalRunId = id,
                testCaseIds,
                failedTestCount = failedResults.Count,
            }
        );
    }

    private string GenerateHtmlReport(TestRun run, List<TestResult> results)
    {
        var passedCount = results.Count(r => r.Status == TestStatus.Passed);
        var failedCount = results.Count(r => r.Status == TestStatus.Failed);
        var successRate = results.Count > 0 ? (double)passedCount / results.Count * 100 : 0;

        var duration =
            run.CompletedAt.HasValue && run.StartedAt.HasValue
                ? (run.CompletedAt.Value - run.StartedAt.Value).TotalSeconds
                : 0;

        var html =
            $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"">
    <title>Test Report - {run.RunName}</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background: #f5f5f5; }}
        .container {{ max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
        h1 {{ color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }}
        .summary {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }}
        .summary-card {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }}
        .summary-card.passed {{ background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }}
        .summary-card.failed {{ background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); }}
        .summary-card h3 {{ margin: 0 0 10px 0; font-size: 14px; opacity: 0.9; }}
        .summary-card .value {{ font-size: 32px; font-weight: bold; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
        th {{ background: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; }}
        td {{ padding: 12px; border-bottom: 1px solid #dee2e6; }}
        tr:hover {{ background: #f8f9fa; }}
        .status {{ padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }}
        .status.passed {{ background: #d4edda; color: #155724; }}
        .status.failed {{ background: #f8d7da; color: #721c24; }}
        .status.skipped {{ background: #fff3cd; color: #856404; }}
        .error {{ background: #f8d7da; padding: 10px; border-radius: 4px; margin-top: 5px; font-family: monospace; font-size: 12px; }}
        .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; }}
    </style>
</head>
<body>
    <div class=""container"">
        <h1>Test Report: {run.RunName}</h1>
        
        <div class=""summary"">
            <div class=""summary-card"">
                <h3>Total Tests</h3>
                <div class=""value"">{results.Count}</div>
            </div>
            <div class=""summary-card passed"">
                <h3>Passed</h3>
                <div class=""value"">{passedCount}</div>
            </div>
            <div class=""summary-card failed"">
                <h3>Failed</h3>
                <div class=""value"">{failedCount}</div>
            </div>
            <div class=""summary-card"">
                <h3>Success Rate</h3>
                <div class=""value"">{successRate:F1}%</div>
            </div>
        </div>

        <table>
            <tr>
                <th>Environment</th>
                <td>{run.Environment}</td>
                <th>Browser</th>
                <td>{run.Browser}</td>
            </tr>
            <tr>
                <th>Started</th>
                <td>{run.StartedAt:yyyy-MM-dd HH:mm:ss}</td>
                <th>Duration</th>
                <td>{duration:F2}s</td>
            </tr>
        </table>

        <h2>Test Results</h2>
        <table>
            <thead>
                <tr>
                    <th>Test Case</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Run At</th>
                </tr>
            </thead>
            <tbody>
                {string.Join("", results.Select(r => $@"
                <tr>
                    <td>{r.TestCase?.Name ?? "Unknown"}</td>
                    <td><span class=""status {r.Status.ToString().ToLower()}"">{r.Status}</span></td>
                    <td>{r.DurationMs}ms</td>
                    <td>{r.RunAt:HH:mm:ss}</td>
                </tr>
                {(string.IsNullOrEmpty(r.ErrorMessage) ? "" : $@"
                <tr>
                    <td colspan=""4"">
                        <div class=""error"">
                            <strong>Error:</strong> {r.ErrorMessage}<br/>
                            {(string.IsNullOrEmpty(r.StackTrace) ? "" : $"<pre>{r.StackTrace}</pre>")}
                        </div>
                    </td>
                </tr>
                ")}"
                ))}
            </tbody>
        </table>

        <div class=""footer"">
            Generated on {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC
        </div>
    </div>
</body>
</html>";

        return html;
    }
}
