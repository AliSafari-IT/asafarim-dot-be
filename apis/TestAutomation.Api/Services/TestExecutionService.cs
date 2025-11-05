using System.Net.Http.Json;
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
        var suites = request.TestSuiteIds != null ? (
                    await _db
                        .TestSuites.Where(s => request.TestSuiteIds.Contains(s.Id))
                        .Select(s => new
                        {
                            id = s.Id,
                            name = s.Name,
                            fixtureId = s.FixtureId,
                            testCases = s
                                .TestCases.Where(tc => tc.IsActive)
                                .Select(tc => new
                                {
                                    id = tc.Id,
                                    name = tc.Name,
                                    testType = tc.TestType.ToString().ToLower(),
                                    steps = tc.Steps,
                                    scriptText = tc.ScriptText,
                                    testDataSets = tc
                                        .TestDataSets.Where(d => d.IsActive)
                                        .Select(d => new
                                        {
                                            id = d.Id,
                                            name = d.Name,
                                            data = d.Data, // Fixed: use Data instead of InputData
                                        }),
                                }),
                        })
                        .ToListAsync()
                ).Cast<object>().ToList() : new List<object>();

        var testCasesDirect = request.TestCaseIds != null ? (
                    await _db
                        .TestCases.Where(tc => request.TestCaseIds.Contains(tc.Id))
                        .Select(tc => new
                        {
                            id = tc.Id,
                            name = tc.Name,
                            testType = tc.TestType.ToString().ToLower(),
                            steps = tc.Steps,
                            scriptText = tc.ScriptText,
                            testDataSets = tc
                                .TestDataSets.Where(d => d.IsActive)
                                .Select(d => new
                                {
                                    id = d.Id,
                                    name = d.Name,
                                    data = d.Data,
                                }),
                        })
                        .ToListAsync()
                ).Cast<object>().ToList() : new List<object>();

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

        // Send to Node runner
        var client = _httpClientFactory.CreateClient("TestRunnerClient");
        client.DefaultRequestHeaders.Add("x-api-key", _config["TestRunner:ApiKey"] ?? "");
        var response = await client.PostAsJsonAsync("/run-tests", payload);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Failed to start Node runner: {Status}", response.StatusCode);
            run.Status = TestRunStatus.Failed;
            await _db.SaveChangesAsync();
        }

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
            })
            .ToList();
    }

    public Task UpdateTestRunStatusAsync(Guid testRunId, string status)
    {
        // Will be used by webhook or SignalR to update status from Node runner
        throw new NotImplementedException();
    }

    public Task ProcessTestResultAsync(TestResultDto testResult)
    {
        // Will be used by webhook or SignalR to persist individual results during run
        throw new NotImplementedException();
    }
}
