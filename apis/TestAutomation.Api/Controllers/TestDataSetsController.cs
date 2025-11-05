using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestAutomation.Api.Data;
using TestAutomation.Api.DTOs;
using TestAutomation.Api.Models;

namespace TestAutomation.Api.Controllers;

[ApiController]
[Route("api/test-data-sets")]
[Authorize]
public class TestDataSetsController : ControllerBase
{
    private readonly TestAutomationDbContext _db;

    public TestDataSetsController(TestAutomationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? testCaseId)
    {
        var q = _db.TestDataSets.AsQueryable();
        if (testCaseId.HasValue)
            q = q.Where(td => td.TestCaseId == testCaseId);
        var items = await q.AsNoTracking().ToListAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var entity = await _db.TestDataSets.FindAsync(id);
        return entity == null ? NotFound() : Ok(entity);
    }

    [HttpPost]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> Create([FromBody] CreateTestDataSetDto model)
    {
        var entity = new TestDataSet
        {
            Id = Guid.NewGuid(),
            TestCaseId = model.TestCaseId,
            Name = model.Name,
            Description = model.Description,
            Data = model.Data, // Changed from InputData/ExpectedOutput
            IsActive = model.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedById = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!),
            UpdatedById = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!),
        };
        _db.TestDataSets.Add(entity);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTestDataSetDto model)
    {
        var entity = await _db.TestDataSets.FindAsync(id);
        if (entity == null)
            return NotFound();
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.Data = model.Data;
        entity.IsActive = model.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedById = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _db.SaveChangesAsync();
        return Ok(entity);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var entity = await _db.TestDataSets.FindAsync(id);
        if (entity == null)
            return NotFound();
        _db.TestDataSets.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
