using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TestAutomation.Api.Data;
using TestAutomation.Api.DTOs;
using TestAutomation.Api.Hubs;
using TestAutomation.Api.Models;
using TestAutomation.Api.Services.Interfaces;

namespace TestAutomation.Api.Services;

public class TestExecutionService : ITestExecutionService
{
    private readonly TestAutomationDbContext _db;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;
    private readonly IHubContext<TestRunHub> _hubContext;
    private readonly ILogger<TestExecutionService> _logger;

    public TestExecutionService(
        TestAutomationDbContext db,
        IHttpClientFactory httpClientFactory,
        IConfiguration config,
        IHubContext<TestRunHub> hubContext,
        ILogger<TestExecutionService> logger
    )
    {
        _db = db;
        _httpClientFactory = httpClientFactory;
        _config = config;
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task<TestRunDto> StartTestRunAsync(StartTestRunDto request, string userId)
    {
        var run = new TestRun
        {
            Id = Guid.NewGuid(),
            RunName = request.RunName,
            FunctionalRequirementId = request.FunctionalRequirementId,
            Environment = request.Environment,
            Browser = request.Browser,
            Status = TestRunStatus.Running,
            StartedAt = DateTime.UtcNow,
            ExecutedById = Guid.TryParse(userId, out var uid) ? uid : null,
            TriggerType = TriggerType.Manual,
        };

        _db.TestRuns.Add(run);
        await _db.SaveChangesAsync();

        // Build payload for Node runner
        var suites =
            request.TestSuiteIds != null
                ? (
                    await _db
                        .TestSuites.Where(s => request.TestSuiteIds.Contains(s.Id))
                        .Include(s => s.TestCases)
                        .ThenInclude(tc => tc.TestDataSets)
                        .ToListAsync()
                )
                    .Select(s => new
                    {
                        id = s.Id,
                        name = s.Name,
                        fixtureId = s.FixtureId,
                        pageUrl = _db
                            .TestFixtures.Where(f => f.Id == s.FixtureId)
                            .Select(f => f.PageUrl)
                            .FirstOrDefault(),
                        testCases = s
                            .TestCases.Where(tc => tc.IsActive)
                            .Select(tc =>
                            {
                                var stepsJson = tc.Steps?.RootElement.GetRawText();
                                if (stepsJson != null)
                                {
                                    _logger.LogInformation(
                                        "Step data for test case {TestCaseId}: {StepData}",
                                        tc.Id,
                                        stepsJson
                                    );
                                }
                                return new
                                {
                                    id = tc.Id,
                                    name = tc.Name,
                                    testType = tc.TestType.ToString().ToLower(),
                                    steps = stepsJson != null
                                        ? JsonSerializer.Deserialize<object>(stepsJson)
                                        : null,
                                    scriptText = tc.ScriptText,
                                    testDataSets = tc
                                        .TestDataSets.Where(d => d.IsActive)
                                        .Select(d => new
                                        {
                                            id = d.Id,
                                            name = d.Name,
                                            data = JsonSerializer.Deserialize<object>(
                                                d.Data.RootElement.GetRawText()
                                            ),
                                        }),
                                };
                            }),
                    })
                    .Cast<object>()
                    .ToList()
                : new List<object>();

        var testCasesDirect =
            request.TestCaseIds != null
                ? (
                    await _db
                        .TestCases.Where(tc => request.TestCaseIds.Contains(tc.Id))
                        .Include(tc => tc.TestDataSets)
                        .ToListAsync()
                )
                    .Select(tc =>
                    {
                        var stepsJson = tc.Steps?.RootElement.GetRawText();
                        if (stepsJson != null)
                        {
                            _logger.LogInformation(
                                "Step data for direct test case {TestCaseId}: {StepData}",
                                tc.Id,
                                stepsJson
                            );
                        }
                        return new
                        {
                            id = tc.Id,
                            name = tc.Name,
                            testType = tc.TestType.ToString().ToLower(),
                            steps = stepsJson != null
                                ? JsonSerializer.Deserialize<object>(stepsJson)
                                : null,
                            scriptText = tc.ScriptText,
                            testDataSets = tc
                                .TestDataSets.Where(d => d.IsActive)
                                .Select(d => new
                                {
                                    id = d.Id,
                                    name = d.Name,
                                    data = JsonSerializer.Deserialize<object>(
                                        d.Data.RootElement.GetRawText()
                                    ),
                                }),
                        };
                    })
                    .Cast<object>()
                    .ToList()
                : new List<object>();

        var payload = new
        {
            runId = run.Id.ToString(),
            runName = run.RunName,
            functionalRequirementId = run.FunctionalRequirementId?.ToString(),
            environment = run.Environment,
            browser = run.Browser,
            apiUrl = _config["ApiBaseUrl"] ?? "http://localhost:5200",
            userId,
            testSuites = suites,
            testCases = testCasesDirect,
        };

        // Log the full payload for debugging
        var payloadJson = System.Text.Json.JsonSerializer.Serialize(
            payload,
            new System.Text.Json.JsonSerializerOptions { WriteIndented = true }
        );
        _logger.LogInformation("Sending test run payload to TestRunner: {Payload}", payloadJson);

        // Send to Node runner (fire-and-forget - don't wait for tests to complete)
        var client = _httpClientFactory.CreateClient("TestRunnerClient");
        client.DefaultRequestHeaders.Add("x-api-key", _config["TestRunner:ApiKey"] ?? "");

        // Start the test run asynchronously without waiting for it to complete
        _ = Task.Run(async () =>
        {
            try
            {
                var response = await client.PostAsJsonAsync("/run-tests", payload);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Failed to start Node runner: {Status}", response.StatusCode);
                    run.Status = TestRunStatus.Failed;
                    await _db.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending test run request to TestRunner");
                run.Status = TestRunStatus.Failed;
                await _db.SaveChangesAsync();
            }
        });

        _logger.LogInformation(
            "Test run {RunId} started, tests are executing in background",
            run.Id
        );

        return new TestRunDto
        {
            Id = run.Id,
            RunName = run.RunName,
            FunctionalRequirementId = run.FunctionalRequirementId,
            Environment = run.Environment,
            Browser = run.Browser,
            Status = run.Status.ToString(),
            StartedAt = run.StartedAt,
            ExecutedBy = userId,
            TriggerType = run.TriggerType.ToString(),
        };
    }

    public async Task<bool> CancelTestRunAsync(Guid testRunId, string userId)
    {
        var run = await _db.TestRuns.FirstOrDefaultAsync(r => r.Id == testRunId);
        if (run == null || run.Status != TestRunStatus.Running)
            return false;

        var client = _httpClientFactory.CreateClient("TestRunnerClient");
        client.DefaultRequestHeaders.Add("x-api-key", _config["TestRunner:ApiKey"] ?? "");
        var response = await client.PostAsync($"/cancel/{testRunId}", null);
        if (response.IsSuccessStatusCode)
        {
            run.Status = TestRunStatus.Cancelled;
            run.CompletedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return true;
        }
        return false;
    }

    public async Task<TestRunDto?> GetTestRunStatusAsync(Guid testRunId)
    {
        var run = await _db
            .TestRuns.Include(r => r.TestResults)
            .FirstOrDefaultAsync(r => r.Id == testRunId);
        if (run == null)
            return null;

        return new TestRunDto
        {
            Id = run.Id,
            RunName = run.RunName,
            FunctionalRequirementId = run.FunctionalRequirementId,
            Environment = run.Environment,
            Browser = run.Browser,
            Status = run.Status.ToString(),
            StartedAt = run.StartedAt,
            CompletedAt = run.CompletedAt,
            ExecutedBy = run.ExecutedById?.ToString(),
            TriggerType = run.TriggerType.ToString(),
            TotalTests = run.TestResults.Count,
            PassedTests = run.TestResults.Count(tr => tr.Status == TestStatus.Passed),
            FailedTests = run.TestResults.Count(tr => tr.Status == TestStatus.Failed),
            SkippedTests = run.TestResults.Count(tr => tr.Status == TestStatus.Skipped),
        };
    }

    public async Task<List<TestRunDto>> GetActiveTestRunsAsync()
    {
        var runs = await _db
            .TestRuns.Where(r =>
                r.Status == TestRunStatus.Running || r.Status == TestRunStatus.Pending
            )
            .ToListAsync();

        return runs.Select(r => new TestRunDto
            {
                Id = r.Id,
                RunName = r.RunName,
                FunctionalRequirementId = r.FunctionalRequirementId,
                Environment = r.Environment,
                Browser = r.Browser,
                Status = r.Status.ToString(),
                StartedAt = r.StartedAt,
                ExecutedBy = r.ExecutedById?.ToString(),
                TriggerType = r.TriggerType.ToString(),
            })
            .ToList();
    }

    public async Task<List<TestRunDto>> GetTestRunHistoryAsync(
        int pageNumber = 1,
        int pageSize = 20
    )
    {
        var query = _db.TestRuns.OrderByDescending(r => r.StartedAt);
        var runs = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
        return runs.Select(r => new TestRunDto
            {
                Id = r.Id,
                RunName = r.RunName,
                FunctionalRequirementId = r.FunctionalRequirementId,
                Environment = r.Environment,
                Browser = r.Browser,
                Status = r.Status.ToString(),
                StartedAt = r.StartedAt,
                CompletedAt = r.CompletedAt,
                ExecutedBy = r.ExecutedById?.ToString(),
                TriggerType = r.TriggerType.ToString(),
                TotalTests = r.TotalTests,
                PassedTests = r.PassedTests,
                FailedTests = r.FailedTests,
                SkippedTests = r.SkippedTests,
            })
            .ToList();
    }

    public async Task UpdateTestRunStatusAsync(
        Guid testRunId,
        string status,
        int? totalTests = null,
        int? passedTests = null,
        int? failedTests = null
    )
    {
        _logger.LogInformation(
            "🔍 UpdateTestRunStatusAsync called with - RunId: {TestRunId}, Status: {Status}, Total: {Total}, Passed: {Passed}, Failed: {Failed}",
            testRunId,
            status,
            totalTests,
            passedTests,
            failedTests
        );

        var run = await _db.TestRuns.FindAsync(testRunId);
        if (run == null)
        {
            _logger.LogWarning("❌ Test run {TestRunId} not found", testRunId);
            return;
        }

        _logger.LogInformation(
            "📝 Current run status: {CurrentStatus}, Current counts - Total: {CurrentTotal}, Passed: {CurrentPassed}, Failed: {CurrentFailed}",
            run.Status,
            run.TotalTests,
            run.PassedTests,
            run.FailedTests
        );

        // Update status if provided and valid
        if (Enum.TryParse<TestRunStatus>(status, true, out var statusEnum))
        {
            run.Status = statusEnum;
            _logger.LogInformation("🔄 Updated status to: {Status}", statusEnum);

            // Set completion time if the run is now completed/failed/cancelled
            if (
                statusEnum
                is TestRunStatus.Completed
                    or TestRunStatus.Failed
                    or TestRunStatus.Cancelled
            )
            {
                run.CompletedAt = DateTime.UtcNow;
                _logger.LogInformation("🏁 Run completed at: {CompletedAt}", run.CompletedAt);
            }
        }

        // Update test result counts if provided
        if (totalTests.HasValue)
        {
            run.TotalTests = totalTests.Value;
            _logger.LogInformation("📊 Set TotalTests to: {Total}", totalTests.Value);
        }

        if (passedTests.HasValue)
        {
            run.PassedTests = passedTests.Value;
            _logger.LogInformation("✅ Set PassedTests to: {Passed}", passedTests.Value);
        }

        if (failedTests.HasValue)
        {
            run.FailedTests = failedTests.Value;
            _logger.LogInformation("❌ Set FailedTests to: {Failed}", failedTests.Value);
        }

        // Calculate skipped tests if we have total and passed/failed
        if (totalTests.HasValue && (passedTests.HasValue || failedTests.HasValue))
        {
            run.SkippedTests = totalTests.Value - (passedTests ?? 0) - (failedTests ?? 0);
            _logger.LogInformation("⏩ Calculated SkippedTests: {Skipped}", run.SkippedTests);
        }

        run.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _db.SaveChangesAsync();
            _logger.LogInformation("💾 Successfully saved changes to database");

            // Verify the values were saved correctly
            var savedRun = await _db
                .TestRuns.AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == testRunId);
            if (savedRun != null)
            {
                _logger.LogInformation(
                    "🔍 Database verification - Total: {Total}, Passed: {Passed}, Failed: {Failed}",
                    savedRun.TotalTests,
                    savedRun.PassedTests,
                    savedRun.FailedTests
                );
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error saving test run updates to database");
            throw;
        }

        _logger.LogInformation(
            "✅ Updated test run {TestRunId} status to {Status} (Passed: {Passed}, Failed: {Failed}, Total: {Total})",
            testRunId,
            status,
            run.PassedTests,
            run.FailedTests,
            run.TotalTests
        );
    }

    public Task ProcessTestResultAsync(TestResultDto testResult)
    {
        // Will be used by webhook or SignalR to persist individual results during run
        throw new NotImplementedException();
    }
}
