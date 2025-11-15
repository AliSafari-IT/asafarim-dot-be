// apis/TestAutomation.Api/Controllers/TestSuitesController.cs
using System.Net.Http;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TestAutomation.Api.Data;
using TestAutomation.Api.DTOs;
using TestAutomation.Api.Models;
using TestAutomation.Api.Services;

namespace TestAutomation.Api.Controllers;

[ApiController]
[Route("api/test-suites")]
[Authorize]
public class TestSuitesController : ControllerBase
{
    private readonly TestAutomationDbContext _db;
    private readonly TestCafeGeneratorService _generatorService;
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<TestSuitesController> _logger;

    public TestSuitesController(
        TestAutomationDbContext db,
        TestCafeGeneratorService generatorService,
        IConfiguration config,
        IHttpClientFactory httpClientFactory,
        ILogger<TestSuitesController> logger
    )
    {
        _db = db;
        _generatorService = generatorService;
        _configuration = config;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? fixtureId,
        [FromQuery] Guid? functionalRequirementId
    )
    {
        var q = _db.TestSuites.Include(s => s.Fixture).AsQueryable();

        if (fixtureId.HasValue)
            q = q.Where(s => s.FixtureId == fixtureId);

        if (functionalRequirementId.HasValue)
            q = q.Where(s => s.Fixture.FunctionalRequirementId == functionalRequirementId);

        var items = await q.AsNoTracking().ToListAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var entity = await _db
            .TestSuites.Include(s => s.Fixture)
            .FirstOrDefaultAsync(s => s.Id == id);
        return entity == null ? NotFound() : Ok(entity);
    }

    [HttpPost]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> Create([FromBody] CreateTestSuiteDto model)
    {
        var testSuite = new TestSuite
        {
            Id = Guid.NewGuid(),
            Name = model.Name,
            Description = model.Description,
            FixtureId = model.FixtureId,
            ExecutionOrder = model.ExecutionOrder,
            IsActive = model.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedById = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!),
        };
        _db.TestSuites.Add(testSuite);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = testSuite.Id }, testSuite);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTestSuiteDto model)
    {
        model.Id = id;
        var testSuite = await _db.TestSuites.FindAsync(id);
        if (testSuite == null)
            return NotFound();
        testSuite.Name = model.Name;
        testSuite.Description = model.Description;
        testSuite.FixtureId = model.FixtureId;
        testSuite.ExecutionOrder = model.ExecutionOrder;
        testSuite.IsActive = model.IsActive;
        testSuite.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(testSuite);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var entity = await _db.TestSuites.FindAsync(id);
        if (entity == null)
            return NotFound();
        _db.TestSuites.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // 🧩 Get TestCases under a TestSuite
    [HttpGet("{id}/test-cases")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTestCases(Guid id)
    {
        var testCases = await _db.TestCases.Where(tc => tc.TestSuiteId == id).ToListAsync();
        return Ok(testCases);
    }

    // 🧩 Create a TestCase under a TestSuite
    [HttpPost("{id}/test-cases")]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> CreateTestCase(
        Guid suiteId,
        [FromBody] CreateTestCaseDto model
    )
    {
        var suite = await _db.TestSuites.FindAsync(suiteId);
        if (suite == null)
            return NotFound(new { message = "Test suite not found." });

        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var testCase = new TestCase
        {
            Id = Guid.NewGuid(),
            TestSuiteId = suiteId,
            Name = model.Name,
            Description = model.Description,
            TestType = model.TestType,
            Steps =
                model.TestType == TestType.Steps && model.Steps != null
                    ? JsonDocument.Parse(JsonSerializer.Serialize(model.Steps))
                    : null,
            ScriptText = model.TestType == TestType.Script ? model.ScriptText : null,
            TimeoutMs = model.TimeoutMs,
            RetryCount = model.RetryCount,
            IsActive = model.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedById = userId,
            UpdatedById = userId,
        };

        _db.TestCases.Add(testCase);
        await _db.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = suiteId },
            new { message = "Test case created successfully", testCase }
        );
    }

    // 🔄 Generate TestCafe file for a test suite
    [HttpPost("{id}/generate-testcafe")]
    [AllowAnonymous] // Allow API key access from TestRunner
    public async Task<IActionResult> GenerateTestCafeFile(Guid id)
    {
        try
        {
            var testSuite = await _db.TestSuites.FirstOrDefaultAsync(ts => ts.Id == id);
            if (testSuite == null)
                return NotFound(new { message = "Test suite not found." });

            // Generate the TestCafe file
            var (filePath, fileContent) = await _generatorService.GenerateTestCafeFileAsync(id);

            // Save to database
            testSuite.GeneratedTestCafeFile = fileContent;
            testSuite.GeneratedFilePath = filePath; // Store the relative path
            testSuite.GeneratedAt = DateTime.UtcNow;
            testSuite.UpdatedAt = DateTime.UtcNow;

            _db.TestSuites.Update(testSuite);
            await _db.SaveChangesAsync();

            Console.WriteLine(
                $"[TestSuite Generator] ✅ Saved GeneratedTestCafeFile to DB for suite {id}"
            );

            return Ok(
                new
                {
                    message = "TestCafe file generated successfully",
                    generatedAt = testSuite.GeneratedAt,
                    filePath,
                    fileContent,
                }
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[TestSuite Generator] ❌ Error: {ex.Message}");
            return BadRequest(new { message = $"Failed to generate TestCafe file: {ex.Message}" });
        }
    }

    // 📄 Get generated TestCafe file
    [HttpGet("{id}/testcafe-file")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTestCafeFile(Guid id)
    {
        var testSuite = await _db.TestSuites.FindAsync(id);
        if (testSuite == null)
            return NotFound(new { message = "Test suite not found." });

        if (string.IsNullOrEmpty(testSuite.GeneratedTestCafeFile))
            return NotFound(new { message = "No TestCafe file has been generated yet." });

        return Ok(
            new
            {
                fileContent = testSuite.GeneratedTestCafeFile,
                filePath = testSuite.GeneratedFilePath,
                generatedAt = testSuite.GeneratedAt,
            }
        );
    }

    // Run generated TestCafe file
    [HttpPost("{id}/run-generated")]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> RunGeneratedTestCafeFile(
        Guid id,
        [FromQuery] string? browser = "chrome"
    )
    {
        try
        {
            _logger.LogInformation(
                "Running generated TestCafe file for test suite {TestSuiteId} with browser {Browser}",
                id,
                browser
            );

            var testSuite = await _db.TestSuites.FindAsync(id);
            if (testSuite == null)
            {
                _logger.LogWarning("Test suite {TestSuiteId} not found", id);
                return NotFound(new { message = "Test suite not found." });
            }

            if (string.IsNullOrEmpty(testSuite.GeneratedTestCafeFile))
            {
                _logger.LogWarning("Test suite {TestSuiteId} has no generated TestCafe file", id);
                return BadRequest(
                    new
                    {
                        message = "No TestCafe file has been generated yet. Please generate the file first.",
                    }
                );
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

            // Create a test run record
            var run = new TestRun
            {
                Id = Guid.NewGuid(),
                RunName = $"Generated: {testSuite.Name}",
                FunctionalRequirementId = null, // Generated runs don't have FR context
                Environment = "local",
                Browser = browser ?? "chrome",
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
            _logger.LogInformation(
                "Created test run {RunId} for test suite {TestSuiteId}",
                run.Id,
                id
            );

            // Call TestRunner service to execute the generated file
            var testRunnerUrl = _configuration["TestRunner:BaseUrl"] ?? "http://localhost:4000";
            var apiKey = _configuration["TestRunner:ApiKey"] ?? "test-runner-api-key-2024";

            _logger.LogInformation(
                "Sending request to TestRunner at {TestRunnerUrl}/run-generated-file",
                testRunnerUrl
            );

            try
            {
                var httpClient = _httpClientFactory?.CreateClient("TestRunnerClient");
                if (httpClient == null)
                {
                    throw new InvalidOperationException("HttpClientFactory is not available");
                }

                httpClient.DefaultRequestHeaders.Remove("x-api-key");
                httpClient.DefaultRequestHeaders.Add("x-api-key", apiKey);

                var payload = new
                {
                    testSuiteId = testSuite.Id.ToString(),
                    fileContent = testSuite.GeneratedTestCafeFile,
                    browser = browser ?? "chrome",
                    runId = run.Id.ToString(),
                    filePath = testSuite.GeneratedFilePath,
                };

                _logger.LogInformation(
                    "Payload prepared: testSuiteId={TestSuiteId}, runId={RunId}, browser={Browser}, fileContentLength={FileLength}",
                    testSuite.Id,
                    run.Id,
                    browser,
                    testSuite.GeneratedTestCafeFile?.Length ?? 0
                );

                var response = await httpClient.PostAsJsonAsync("/run-generated-file", payload);

                if (!response.IsSuccessStatusCode)
                {
                    var errorText = await response.Content.ReadAsStringAsync();
                    _logger.LogError(
                        "TestRunner returned error status {StatusCode}: {Error}",
                        response.StatusCode,
                        errorText
                    );

                    // Update test run status to failed
                    run.Status = TestRunStatus.Failed;
                    run.CompletedAt = DateTime.UtcNow;
                    await _db.SaveChangesAsync();

                    return StatusCode(
                        (int)response.StatusCode,
                        new { message = $"Failed to start test run: {errorText}" }
                    );
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogInformation("TestRunner accepted request: {Response}", responseContent);
            }
            catch (HttpRequestException httpEx)
            {
                _logger.LogError(
                    httpEx,
                    "HTTP error connecting to TestRunner: {Message}",
                    httpEx.Message
                );
                run.Status = TestRunStatus.Failed;
                run.CompletedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
                return StatusCode(
                    500,
                    new
                    {
                        message = $"Failed to connect to TestRunner: {httpEx.Message}",
                        error = httpEx.Message,
                    }
                );
            }
            catch (TaskCanceledException timeoutEx)
            {
                _logger.LogError(
                    timeoutEx,
                    "Timeout connecting to TestRunner: {Message}",
                    timeoutEx.Message
                );
                run.Status = TestRunStatus.Failed;
                run.CompletedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
                return StatusCode(
                    500,
                    new { message = "TestRunner request timed out", error = timeoutEx.Message }
                );
            }

            return Ok(
                new
                {
                    message = "Test run started successfully",
                    runId = run.Id,
                    testSuiteId = testSuite.Id,
                    testSuiteName = testSuite.Name,
                }
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error running generated TestCafe file for test suite {TestSuiteId}",
                id
            );
            return StatusCode(
                500,
                new
                {
                    message = $"Failed to run generated TestCafe file: {ex.Message}",
                    error = ex.Message,
                    details = ex.StackTrace,
                }
            );
        }
    }
}
