using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestAutomation.Api.Data;
using TestAutomation.Api.Models;

namespace TestAutomation.Api.Controllers;

[ApiController]
[Route("api/functional-requirements")]
[Authorize]
public class FunctionalRequirementsController : ControllerBase
{
    private readonly TestAutomationDbContext _db;

    public FunctionalRequirementsController(TestAutomationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _db.FunctionalRequirements.AsNoTracking().ToListAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById([FromRoute] Guid id)
    {
        var item = await _db.FunctionalRequirements.FindAsync(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> Create([FromBody] FunctionalRequirement model)
    {
        model.Id = Guid.NewGuid();
        model.CreatedAt = DateTime.UtcNow;
        model.UpdatedAt = DateTime.UtcNow;
        _db.FunctionalRequirements.Add(model);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = model.Id }, model);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] FunctionalRequirement model)
    {
        var entity = await _db.FunctionalRequirements.FindAsync(id);
        if (entity == null) return NotFound();
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.ProjectName = model.ProjectName;
        entity.IsActive = model.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(entity);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        var entity = await _db.FunctionalRequirements.FindAsync(id);
        if (entity == null) return NotFound();
        _db.FunctionalRequirements.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}