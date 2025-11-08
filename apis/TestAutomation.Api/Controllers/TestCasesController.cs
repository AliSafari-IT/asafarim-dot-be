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
            Steps = model.Steps,
            ScriptText = model.ScriptText,
            TimeoutMs = model.TimeoutMs,
            RetryCount = model.RetryCount,
            IsActive = model.IsActive,
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
        model.Id = id;
        model.UpdatedAt = DateTime.UtcNow;
        model.UpdatedById = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var entity = await _db.TestCases.FindAsync(id);
        if (entity == null)
            return NotFound();
        entity.Name = model.Name;
        entity.TestSuiteId = model.TestSuiteId;
        entity.Description = model.Description;
        // Fix: Convert string to enum properly
        entity.TestType = Enum.IsDefined(typeof(TestType), model.TestType)
            ? model.TestType
            : TestType.Steps;
        entity.Steps = model.Steps;
        entity.ScriptText = model.ScriptText;
        entity.TimeoutMs = model.TimeoutMs;
        entity.RetryCount = model.RetryCount;
        entity.IsActive = model.IsActive;
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
