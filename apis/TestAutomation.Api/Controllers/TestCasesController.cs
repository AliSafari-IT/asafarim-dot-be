// apis/TestAutomation.Api/Controllers/TestCasesController.cs
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TestAutomation.Api.Data;
using TestAutomation.Api.DTOs;
using TestAutomation.Api.Models;

namespace TestAutomation.Api.Controllers;

[ApiController]
[Route("api/test-cases")]
[Authorize]
public class TestCasesController : ControllerBase
{
    private readonly TestAutomationDbContext _db;

    public TestCasesController(TestAutomationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] Guid? testSuiteId)
    {
        var q = _db.TestCases.AsQueryable();
        if (testSuiteId.HasValue)
            q = q.Where(tc => tc.TestSuiteId == testSuiteId);
        var items = await q.AsNoTracking().ToListAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var entity = await _db.TestCases.FindAsync(id);
        return entity == null ? NotFound() : Ok(entity);
    }

    [HttpPost]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> Create([FromBody] CreateTestCaseDto model)
    {
        var entity = new TestCase
        {
            Id = Guid.NewGuid(),
            TestSuiteId = model.TestSuiteId,
            Name = model.Name,
            Description = model.Description,
            TestType = Enum.IsDefined(typeof(TestType), model.TestType)
                ? model.TestType
                : TestType.Steps,

            // Test Hooks
            BeforeTestHook = model.BeforeTestHook,
            AfterTestHook = model.AfterTestHook,
            BeforeEachStepHook = model.BeforeEachStepHook,
            AfterEachStepHook = model.AfterEachStepHook,

            // Test Configuration
            Skip = model.Skip,
            SkipReason = model.SkipReason,
            Only = model.Only,
            Meta = model.Meta,
            PageUrl = model.PageUrl,

            // Test Behavior
            RequestHooks = model.RequestHooks,
            ClientScripts = model.ClientScripts,
            ScreenshotOnFail = model.ScreenshotOnFail,
            VideoOnFail = model.VideoOnFail,

            // Test Content
            Steps = model.Steps,
            ScriptText = model.ScriptText,
            GherkinSyntax = model.GherkinSyntax,
            TimeoutMs = model.TimeoutMs,
            RetryCount = model.RetryCount,
            IsActive = model.IsActive,

            // Audit fields
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedById = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!),
            UpdatedById = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!),
        };
        _db.TestCases.Add(entity);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTestCaseDto model)
    {
        var entity = await _db.TestCases.FindAsync(id);
        if (entity == null)
            return NotFound();

        // Basic properties
        entity.Name = model.Name;
        entity.TestSuiteId = model.TestSuiteId;
        entity.Description = model.Description;
        entity.TestType = Enum.IsDefined(typeof(TestType), model.TestType)
            ? model.TestType
            : TestType.Steps;

        // Test Hooks
        entity.BeforeTestHook = model.BeforeTestHook;
        entity.AfterTestHook = model.AfterTestHook;
        entity.BeforeEachStepHook = model.BeforeEachStepHook;
        entity.AfterEachStepHook = model.AfterEachStepHook;

        // Test Configuration
        entity.Skip = model.Skip;
        entity.SkipReason = model.SkipReason;
        entity.Only = model.Only;
        entity.Meta = model.Meta;
        entity.PageUrl = model.PageUrl;

        // Test Behavior
        entity.RequestHooks = model.RequestHooks;
        entity.ClientScripts = model.ClientScripts;
        entity.ScreenshotOnFail = model.ScreenshotOnFail;
        entity.VideoOnFail = model.VideoOnFail;

        // Test Content
        entity.Steps = model.Steps;
        entity.ScriptText = model.ScriptText;
        entity.GherkinSyntax = model.GherkinSyntax;
        entity.TimeoutMs = model.TimeoutMs;
        entity.RetryCount = model.RetryCount;
        entity.IsActive = model.IsActive;

        // Audit fields
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedById = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        await _db.SaveChangesAsync();
        return Ok(entity);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var entity = await _db.TestCases.FindAsync(id);
        if (entity == null)
            return NotFound();
        _db.TestCases.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
