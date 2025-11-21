// apis/TestAutomation.Api/Services/TestExecutionService.cs
using System.Linq;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
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
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedById = Guid.TryParse(userId, out var uidc) ? uidc : null,
            UpdatedById = Guid.TryParse(userId, out var uidu) ? uidu : null,
        };

        _db.TestRuns.Add(run);
        await _db.SaveChangesAsync();

        // Generate TestCafe files for each test suite
        var testSuiteIds = request.TestSuiteIds ?? new List<Guid>();
        var testCafeGenerator = new TestCafeGeneratorService(_db);

        _logger.LogInformation("🔄 Regenerating TestCafe files for all test suites in this run...");

        var generatedFiles = new List<(Guid suiteId, string filePath, string fileContent)>();
        foreach (var suiteId in testSuiteIds)
        {
            try
            {
                _logger.LogInformation("Generating TestCafe file for suite {SuiteId}", suiteId);
                var (filePath, fileContent) = await testCafeGenerator.GenerateTestCafeFileAsync(
                    suiteId
                );
                generatedFiles.Add((suiteId, filePath, fileContent));

                // Update the test suite with the new file path and content
                var testSuite = await _db.TestSuites.FindAsync(suiteId);
                if (testSuite != null)
                {
                    testSuite.GeneratedTestCafeFile = fileContent;
                    testSuite.GeneratedFilePath = filePath;
                    testSuite.GeneratedAt = DateTime.UtcNow;
                    testSuite.UpdatedAt = DateTime.UtcNow;
                    _db.TestSuites.Update(testSuite);
                    await _db.SaveChangesAsync();

                    _logger.LogInformation(
                        "💾 Updated database with new GeneratedFilePath: {FilePath}",
                        filePath
                    );
                }

                _logger.LogInformation(
                    "✅ Generated TestCafe file for suite {SuiteId} at {FilePath}, size: {Size} bytes",
                    suiteId,
                    filePath,
                    fileContent.Length
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "❌ Failed to generate TestCafe file for suite {SuiteId}",
                    suiteId
                );
                throw;
            }
        }

        // After regeneration, check if any test suites still have validation errors
        var suitesWithErrors = new List<(Guid suiteId, string suiteName, string errors)>();
        foreach (var suiteId in testSuiteIds)
        {
            var suite = await _db
                .TestSuites.Include(ts => ts.Fixture)
                .FirstOrDefaultAsync(ts => ts.Id == suiteId);

            if (suite != null && !string.IsNullOrEmpty(suite.Fixture.Remark))
            {
                suitesWithErrors.Add((suiteId, suite.Name, suite.Fixture.Remark));
                _logger.LogWarning(
                    "⚠️ Test suite {SuiteName} has validation warnings: {Errors}",
                    suite.Name,
                    suite.Fixture.Remark
                );
            }
        }

        // Log validation errors but don't abort - let tests run anyway
        if (suitesWithErrors.Any())
        {
            _logger.LogWarning(
                "⚠️ {Count} test suite(s) have validation warnings - proceeding anyway",
                suitesWithErrors.Count
            );
        }
        else
        {
            _logger.LogInformation(
                "✅ All test suites regenerated successfully with no validation errors"
            );
        }

        // If we have generated files, send each of them to the TestRunner separately.
        // The runner will execute every suite file from its own GeneratedFilePath and
        // write a .report.json file next to each .test.js file.
        if (generatedFiles.Count > 0)
        {
            // Fire-and-forget background task that runs suites serially
            _ = Task.Run(async () =>
            {
                var client = _httpClientFactory.CreateClient("TestRunnerClient");
                client.DefaultRequestHeaders.Add("x-api-key", _config["TestRunner:ApiKey"] ?? "");

                var baseUrl = _config["TestRunner:BaseUrl"] ?? "http://localhost:4000";

                foreach (var gf in generatedFiles)
                {
                    try
                    {
                        var payload = new
                        {
                            testSuiteId = gf.suiteId.ToString(),
                            fileContent = gf.fileContent,
                            browser = run.Browser ?? "chrome",
                            runId = run.Id.ToString(),
                            filePath = gf.filePath,
                        };

                        // Log payload summary (not full content) for debugging
                        _logger.LogInformation(
                            "🚀 Sending generated TestCafe file for suite {SuiteId} to TestRunner at {BaseUrl}/run-generated-file with filePath {FilePath}",
                            gf.suiteId,
                            baseUrl,
                            gf.filePath
                        );

                        var response = await client.PostAsJsonAsync("/run-generated-file", payload);

                        if (!response.IsSuccessStatusCode)
                        {
                            var errorContent = await response.Content.ReadAsStringAsync();
                            _logger.LogError(
                                "❌ Failed to start Node runner for suite {SuiteId}: {Status} - {Error}",
                                gf.suiteId,
                                response.StatusCode,
                                errorContent
                            );

                            run.Status = TestRunStatus.Failed;
                            run.CompletedAt = DateTime.UtcNow;
                            await _db.SaveChangesAsync();

                            // Send SignalR update about the failure
                            await _hubContext
                                .Clients.Group($"testrun-{run.Id}")
                                .SendAsync(
                                    "ReceiveTestUpdate",
                                    new
                                    {
                                        testRunId = run.Id.ToString(),
                                        status = "failed",
                                        message = $"Failed to start test runner for suite {gf.suiteId}: {response.StatusCode} - {errorContent}",
                                        timestamp = DateTime.UtcNow,
                                    }
                                );

                            // Stop running remaining suites for this run
                            break;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(
                            ex,
                            "❌ Error sending test run request for suite {SuiteId} to TestRunner: {Message}",
                            gf.suiteId,
                            ex.Message
                        );
                        run.Status = TestRunStatus.Failed;
                        run.CompletedAt = DateTime.UtcNow;
                        await _db.SaveChangesAsync();

                        // Send SignalR update about the failure
                        await _hubContext
                            .Clients.Group($"testrun-{run.Id}")
                            .SendAsync(
                                "ReceiveTestUpdate",
                                new
                                {
                                    testRunId = run.Id.ToString(),
                                    status = "failed",
                                    message = $"Error connecting to TestRunner while starting suite {gf.suiteId}: {ex.Message}",
                                    error = new { message = ex.Message, stack = ex.StackTrace },
                                    timestamp = DateTime.UtcNow,
                                }
                            );

                        // Stop running remaining suites for this run
                        break;
                    }
                }
            });
        }

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
            CreatedById = run.CreatedById,
            UpdatedById = run.UpdatedById,
            CreatedAt = run.CreatedAt,
            UpdatedAt = run.UpdatedAt,
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
            CreatedById = run.CreatedById,
            UpdatedById = run.UpdatedById,
            CreatedAt = run.CreatedAt,
            UpdatedAt = run.UpdatedAt,
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
                CreatedById = r.CreatedById,
                UpdatedById = r.UpdatedById,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
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
                CreatedById = r.CreatedById,
                UpdatedById = r.UpdatedById,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
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

    public async Task ProcessTestResultAsync(TestResultDto testResultDto)
    {
        // Find the test run
        var testRun = await _db.TestRuns.FindAsync(testResultDto.TestRunId);
        if (testRun == null)
        {
            _logger.LogWarning("Test run {TestRunId} not found", testResultDto.TestRunId);
            return;
        }

        // Parse status from string to enum
        if (!Enum.TryParse<TestStatus>(testResultDto.Status, true, out var status))
        {
            _logger.LogWarning("Invalid test status: {Status}", testResultDto.Status);
            return;
        }

        // Map DTO to entity
        var testResult = new TestResult
        {
            Id = testResultDto.Id != Guid.Empty ? testResultDto.Id : Guid.NewGuid(),
            TestRunId = testResultDto.TestRunId,
            TestCaseId = testResultDto.TestCaseId,
            TestDataSetId = testResultDto.TestDataSetId,
            TestSuiteId = testResultDto.TestSuiteId,
            FixtureId = testResultDto.FixtureId,
            FunctionalRequirementId = testResultDto.FunctionalRequirementId,
            Status = status,
            DurationMs = testResultDto.DurationMs,
            ErrorMessage = testResultDto.ErrorMessage,
            StackTrace = testResultDto.StackTrace,
            RunAt = testResultDto.RunAt == default ? DateTime.UtcNow : testResultDto.RunAt,
            ExecutedById = testResultDto.ExecutedById,
        };

        // Hydrate suite/fixture from TestCase if needed
        if (!testResult.TestSuiteId.HasValue || !testResult.FixtureId.HasValue)
        {
            if (testResult.TestCaseId.HasValue)
            {
                var tc = await _db
                    .TestCases.Include(tc => tc.TestSuite)
                    .FirstOrDefaultAsync(tc => tc.Id == testResult.TestCaseId.Value);
                if (tc != null)
                {
                    testResult.TestSuiteId ??= tc.TestSuiteId;
                    testResult.FixtureId ??= tc.TestSuite?.FixtureId;
                }
            }
        }

        // Handle JSON data
        if (testResultDto.Screenshots != null && testResultDto.Screenshots.Any())
        {
            testResult.Screenshots = JsonDocument.Parse(
                JsonSerializer.Serialize(testResultDto.Screenshots)
            );
        }

        if (testResultDto.JsonReport != null)
        {
            testResult.JsonReport = JsonDocument.Parse(
                JsonSerializer.Serialize(testResultDto.JsonReport)
            );
        }

        // Add to database
        _db.TestResults.Add(testResult);

        // Update test run counters
        testRun.UpdatedAt = DateTime.UtcNow;
        testRun.UpdatedById = testResult.ExecutedById;

        switch (testResult.Status)
        {
            case TestStatus.Passed:
                testRun.PassedTests++;
                break;
            case TestStatus.Failed:
                testRun.FailedTests++;
                break;
            case TestStatus.Skipped:
                testRun.SkippedTests++;
                break;
        }

        testRun.TotalTests = testRun.PassedTests + testRun.FailedTests + testRun.SkippedTests;

        // Update TestCase Passed status
        if (testResult.TestCaseId.HasValue)
        {
            var testCase = await _db.TestCases.FindAsync(testResult.TestCaseId.Value);
            if (testCase != null)
            {
                testCase.Passed = testResult.Status == TestStatus.Passed;
                testCase.UpdatedAt = DateTime.UtcNow;
                _db.TestCases.Update(testCase);
            }
        }

        // Update TestSuite Passed status (true only if all tests passed)
        if (testResult.TestSuiteId.HasValue)
        {
            var testSuite = await _db.TestSuites.FindAsync(testResult.TestSuiteId.Value);
            if (testSuite != null)
            {
                // Check if any test in this suite has failed
                var suiteResults = await _db
                    .TestResults.Where(r => r.TestSuiteId == testResult.TestSuiteId.Value)
                    .ToListAsync();

                var hasFailed = suiteResults.Any(r => r.Status == TestStatus.Failed);
                testSuite.Passed = !hasFailed && suiteResults.Count > 0;
                testSuite.UpdatedAt = DateTime.UtcNow;
                _db.TestSuites.Update(testSuite);
            }
        }

        // Save changes
        await _db.SaveChangesAsync();

        // Notify clients via SignalR
        await _hubContext
            .Clients.Group($"testrun-{testRun.Id}")
            .SendAsync(
                "TestResultAdded",
                new
                {
                    id = testResult.Id,
                    testRunId = testResult.TestRunId,
                    testCaseId = testResult.TestCaseId,
                    testCaseName = testResult.TestCase?.Name,
                    status = testResult.Status.ToString(),
                    durationMs = testResult.DurationMs,
                    errorMessage = testResult.ErrorMessage,
                    stackTrace = testResult.StackTrace,
                    runAt = testResult.RunAt,
                    hasJsonReport = testResult.JsonReport != null,
                    jsonReport = testResult.JsonReport != null
                        ? JsonSerializer.Serialize(testResult.JsonReport)
                        : null,
                }
            );

        _logger.LogInformation(
            "Processed test result {TestResultId} for test run {TestRunId} with status {Status}",
            testResult.Id,
            testResult.TestRunId,
            testResult.Status
        );
    }
}
