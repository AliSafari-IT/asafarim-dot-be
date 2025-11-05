// apis/TestAutomation.Api/Controllers/TestSuitesController.cs
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestAutomation.Api.Data;
using TestAutomation.Api.DTOs;
using TestAutomation.Api.Models;

namespace TestAutomation.Api.Controllers;

[ApiController]
[Route("api/test-suites")]
[Authorize]
public class TestSuitesController : ControllerBase
{
    private readonly TestAutomationDbContext _db;

    public TestSuitesController(TestAutomationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? fixtureId)
    {
        var q = _db.TestSuites.AsQueryable();
        if (fixtureId.HasValue)
            q = q.Where(s => s.FixtureId == fixtureId);
        var items = await q.AsNoTracking().ToListAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var entity = await _db.TestSuites.FindAsync(id);
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
}
